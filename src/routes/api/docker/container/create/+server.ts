import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveUserContainer, type UserContainerRequest } from '$lib/server/docker/user/save-user-container'
import { docker } from '$lib/server/docker/client';
import prisma from '$lib/server/client';

interface CreateContainerRequest {
  stackName: string;
  level: number;
  stacks: {
    frontend?: string;
    backend?: string;
    database?: string;
    services?: string;
  };
  /** e.g. "scenario-1" — the scenario folder name */
  scenarioId?: string;
  /** e.g. "LIBRARY_MANAGEMENT" — the project subfolder to mount as /workspace */
  projectFolder?: string;
  /** Human-readable scenario title from project.md, e.g. "BookWise - Library Management System" */
  scenarioTitle?: string;
}

interface StackInfo {
  stackName: string;
  stackVersion?: string;
}

export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    const session = await locals.auth();

    if (!session || !session.user || !session.user.id) {
      return error(401, 'Unauthorized');
    }

    const userId = session.user.id;
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    if (!userExists) {
      return json(
        { success: false, error: 'User not found in database. Your session is outdated — please sign out and sign back in.' },
        { status: 401 }
      );
    }

    const req: CreateContainerRequest = await request.json()
    const { stackName, level, stacks, scenarioId } = req;
    
    // Look up the Scenario by name to get its database ID for currentScenarioId
    let currentScenarioId: string | null = null;
    if (scenarioId) {
      const scenario = await prisma.scenario.findFirst({
        where: { id: scenarioId },
        select: { id: true }
      });
      currentScenarioId = scenario?.id || null;
    }

    // Build the canonical stacks array early — needed for both DB lookup and creation.
    // Each stack now includes version information when available.
    const stacksArray: StackInfo[] = [
      stacks.frontend ? { stackName: stacks.frontend } : null,
      stacks.backend ? { stackName: stacks.backend } : null,
      stacks.database ? { stackName: stacks.database } : null,
      stacks.services ? { stackName: stacks.services } : null
    ].filter((s): s is StackInfo => s !== null && s.stackName !== null && s.stackName !== undefined);

    // --- DB-first lookup for an existing active container ---
    // Checking the DB first is more reliable than matching Docker labels because:
    //  • Restored containers have labels built from DB stacks (raw IDs, e.g. "postgresql")
    //    while buildStackName() maps them to folder names (e.g. "postgres"), causing mismatches.
    //  • A container created before DB tracking was introduced may have no DB record anyway.
    // Only non-archived containers are reusable (archived ones have no running Docker container).
    // One container per stack — any existing container for this userId/level/stacks combination
    // triggers the "alreadyExists" modal, regardless of which scenario was selected.
    const existingDbContainer = await prisma.container.findFirst({
      where: {
        userId,
        level,
        isArchived: false
      },
      include: {
        containerStacks: true
      }
    });

    // Check if the stacks match
    if (existingDbContainer) {
      const existingStackNames = existingDbContainer.containerStacks.map(s => s.stackName);
      const stacksMatch = stacksArray.length === existingStackNames.length &&
        stacksArray.every(s => existingStackNames.includes(s.stackName));

      if (stacksMatch) {
        const existingDockerContainerId = existingDbContainer.containerId;
        try {
          const existingContainer = docker.getContainer(existingDockerContainerId);
          const info = await existingContainer.inspect();
          if (!info.State.Running) {
            await existingContainer.start();
          }
          console.log('[create] DB-first: existing container found:', existingDockerContainerId);
        } catch {
          // The Docker container no longer exists (e.g. was deleted outside the app).
          // Fall through to create a fresh one and update the DB record.
          console.warn('[create] DB record found but Docker container is gone — creating fresh container.');
          return await createFreshContainer();
        }

        return json({
          success: true,
          alreadyExists: true,
          message: 'You already have an active workspace for this stack. Resume your existing session or cancel to choose a different configuration.',
          containerId: existingDockerContainerId,
          dbContainerId: existingDbContainer.id
        });
      }
    }

    // --- DB found nothing: also check Docker by label as a fallback ---
    // This handles containers created before DB tracking was introduced.
    const existingContainers = await docker.listContainers({
      all: true,
      filters: JSON.stringify({
        label: [
          `devsim.userId=${userId}`,
          `devsim.stack=${stackName}`,
          `devsim.level=${level}`
        ]
      })
    });

    // Guard: only reuse a Docker-found container if it ALSO has a DB record.
    // restore-container.ts creates the new Docker container (with devsim.userId label)
    // BEFORE it updates the DB row. Without this check, create would find that
    // in-progress restore container and insert a duplicate DB entry.
    const dockerMatch = existingContainers.length > 0 ? existingContainers[0] : null;
    const dockerMatchDbRecord = dockerMatch
      ? await prisma.container.findFirst({ where: { containerId: dockerMatch.Id, userId } })
      : null;

    if (dockerMatch && dockerMatchDbRecord) {
      const existingContainerId = dockerMatch.Id;
      if (dockerMatch.State !== 'running') {
        await docker.getContainer(existingContainerId).start();
      }
      const { dbContainerId: existingDbId } = await saveUserContainer({
        userId,
        containerId: existingContainerId,
        currentScenarioId: currentScenarioId || '',
        stacks: stacksArray,
        level,
        status: 'created'
      });
      console.log('[create] Existing Container Found:', existingContainerId);
      return json({
        success: true,
        alreadyExists: true,
        message: 'You already have an active workspace for this stack. Resume your existing session or cancel to choose a different configuration.',
        containerId: existingContainerId,
        dbContainerId: existingDbId
      });
    }

    if (dockerMatch && !dockerMatchDbRecord) {
      console.log('[create] Docker container found by label but no DB record — restore in progress. Creating fresh container.');
    }

    async function createFreshContainer() {
      // Use the scenario folder name (e.g. "scenario-2") so each scenario gets its own
      // volume/bind-mount. Falling back to `scenario-${level}` keeps older containers working.
      const scenarioFolder = scenarioId ?? `scenario-${level}`;
      // Generate volume name: {stack-name}-{scenario-folder}
      const volumeName = `${stackName.toLowerCase().replace(/[_ ]+/g, '-')}-${scenarioFolder}`;

      // Generate custom image name based on stack and scenario
      let customImageName = `devsim-project:${stackName.toLowerCase().replace(/[_ ]+/g, '-')}-${scenarioFolder}`;
      
      // If projectFolder is provided (e.g., LIBRARY_MANAGEMENT), add it to the image name
      if (req.projectFolder) {
        customImageName += `-${req.projectFolder.toLowerCase().replace(/[_ ]+/g, '-')}`;
      }
      
      // Check if custom image exists
      let imageToUse = 'devsim-workspace:latest';
      let useVolume = false;
      let volumeMountConfig: string | null = null;
      
      try {
        await docker.getImage(customImageName).inspect();
        imageToUse = customImageName;
        useVolume = false; // If custom image exists, don't use volume
        console.log(`[create] Using custom image: ${imageToUse} (no volume)`);
      } catch {
        console.log(`[create] Custom image '${customImageName}' not found, falling back to default: ${imageToUse} (with volume)`);
        // Check if volume exists
        try {
          await docker.getVolume(volumeName).inspect();
          useVolume = true;
          console.log(`[create] Using volume: ${volumeName}`);
        } catch {
          // Volume doesn't exist, fall back to bind mount
          console.log(`[create] Volume '${volumeName}' not found, falling back to bind mount`);
        }
        
        // Build mount configuration
        if (useVolume) {
          volumeMountConfig = `${volumeName}:/workspace`;
        } else {
          // Fallback to submodule bind mount — use scenarioFolder so scenario-2/scenario-3
          // mount their own directory instead of always defaulting to scenario-1.
          volumeMountConfig = `${process.cwd()}/submodules/projects/tech-stacks/${stackName}/${scenarioFolder}:/workspace`.replace(/\\/g, '/');
        }
      }

      // Create the workspace container.
      // Ports 3000 (Express) and 5173 (Vite) are auto-assigned on the host (HostPort: '')
      // so the project can be previewed from the browser without using host networking,
      const containerConfig: any = {
        Image: imageToUse,
        name: `devsim-${stackName}-${userId}-${level}`,
        Cmd: ['/bin/sh'],
        Tty: true,
        OpenStdin: true,
        WorkingDir: '/workspace',
        ExposedPorts: {
          '5000/tcp': {},
          '3000/tcp': {},
          '5173/tcp': {}
        },
        Env: [
          "DATABASE_HOST=localhost",
          "DATABASE_PORT=5432",
          "DATABASE_USER=devsim",
          "DATABASE_PASSWORD=devsim",
          "DATABASE_NAME=devsim",
          "DATABASE_URL=postgresql://devsim:devsim@localhost:5432/devsim"
        ],
        HostConfig: {
          Memory: 512 * 1024 * 1024,
          AutoRemove: false,
          PortBindings: {
            '5000/tcp': [{ HostPort: '' }],
            '3000/tcp': [{ HostPort: '' }],
            '5173/tcp': [{ HostPort: '' }]
          }
        },
        Labels: {
          'devsim.userId': userId,
          'devsim.stack': stackName,
          'devsim.level': level.toString()
        }
      };

      // Only add Binds if useVolume is true
      if (useVolume && volumeMountConfig) {
        containerConfig.HostConfig.Binds = [volumeMountConfig];
      }

      const container = await docker.createContainer(containerConfig);

      await docker.getContainer(container.id).start();

       // Retrieve the auto-assigned host ports for the preview URLs and database
      const containerInfo = await docker.getContainer(container.id).inspect();
      const assignedBackendPort = containerInfo.NetworkSettings.Ports['5000/tcp']?.[0]?.HostPort;
      const assignedFrontendPort = containerInfo.NetworkSettings.Ports['5173/tcp']?.[0]?.HostPort;
      const assignedDatabasePort = containerInfo.NetworkSettings.Ports['5432/tcp']?.[0]?.HostPort;
      console.log(`[create] Preview ports — backend: ${assignedBackendPort}, frontend: ${assignedFrontendPort}, database: ${assignedDatabasePort}`);

      const userContainer: UserContainerRequest = {
        userId,
        containerId: container.id,
        currentScenarioId: currentScenarioId || '',
        stacks: stacksArray,
        level,
        status: 'created'
      };

      const { dbContainerId } = await saveUserContainer(userContainer);
      console.log('[create] Created fresh container:', container.id);
       return json({
        success: true,
        containerId: container.id,
        dbContainerId,
        ports: {
          backend: assignedBackendPort,
          frontend: assignedFrontendPort,
          database: assignedDatabasePort
        }
      });
    }

    return await createFreshContainer();

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error handling container request:', err);

    // FK violation — stale session whose userId no longer exists in the DB
    if (message.includes('not found in database')) {
      return json({ success: false, error: message }, { status: 401 });
    }

    return json({ success: false, error: message }, { status: 500 });
  }
};
