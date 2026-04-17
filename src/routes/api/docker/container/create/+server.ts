import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveUserContainer, type UserContainerRequest } from '$lib/server/docker/user/save-user-container'
import { docker } from '$lib/server/docker/client';
import prisma from '$lib/server/client';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface CreateContainerRequest {
  stackName: string;
  level: number;
  mode?: 'tutorial' | 'workspace';
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
    const { stackName, level, stacks, scenarioId, projectFolder } = req;
    const launchMode: 'tutorial' | 'workspace' = req.mode === 'tutorial' ? 'tutorial' : 'workspace';

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
    const existingDbContainers = await prisma.container.findMany({
      where: {
        userId,
        level,
        isArchived: false,
        ...(launchMode === 'tutorial'
          ? { status: 'tutorial' }
          : { status: { not: 'tutorial' } })
      },
      include: {
        containerStacks: true
      }
    });

    // Check if stacks match any mode-compatible existing record.
    const existingDbContainer = existingDbContainers.find((candidate) => {
      const existingStackNames = candidate.containerStacks.map((s) => s.stackName);
      return (
        stacksArray.length === existingStackNames.length &&
        stacksArray.every((s) => existingStackNames.includes(s.stackName))
      );
    });

    if (existingDbContainer) {
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
        message:
          launchMode === 'tutorial'
            ? 'You already have an active tutorial for this stack. Resume it or cancel to choose a different configuration.'
            : 'You already have an active workspace for this stack. Resume your existing session or cancel to choose a different configuration.',
        containerId: existingDockerContainerId,
        dbContainerId: existingDbContainer.id
      });
    }

    // --- DB found nothing: also check Docker by label as a fallback ---
    // This handles containers created before DB tracking was introduced.
    const existingContainers = await docker.listContainers({
      all: true,
      filters: JSON.stringify({
        label: [
          `devsim.userId=${userId}`,
          `devsim.stack=${stackName}`,
          `devsim.level=${level}`,
          `devsim.mode=${launchMode}`
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
        status: launchMode === 'tutorial' ? 'tutorial' : 'created'
      });
      console.log('[create] Existing Container Found:', existingContainerId);
      return json({
        success: true,
        alreadyExists: true,
        message:
          launchMode === 'tutorial'
            ? 'You already have an active tutorial for this stack. Resume it or cancel to choose a different configuration.'
            : 'You already have an active workspace for this stack. Resume your existing session or cancel to choose a different configuration.',
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

      let imageToUse = 'devsim-workspace:latest';
      let bindTargetConfig: string | null = null;
      let volumeMountConfig: string | null = null;

      const normalizedStackName = stackName.toLowerCase().replace(/[_ ]+/g, '-');

      if (launchMode === 'tutorial') {
        const tutorialBasePath = path.join(process.cwd(), 'submodules', 'projects', 'tech-stacks', stackName, 'tutorial');
        const tutorialCandidateImages: string[] = [`devsim-project-tutorial:${normalizedStackName}-tutorial`];

        if (fs.existsSync(tutorialBasePath) && fs.statSync(tutorialBasePath).isDirectory()) {
          // Keep a single canonical tutorial image per stack.
        }

        let tutorialImageFound = false;
        for (const candidateImage of tutorialCandidateImages) {
          try {
            await docker.getImage(candidateImage).inspect();
            imageToUse = candidateImage;
            tutorialImageFound = true;
            console.log(`[create] Using tutorial image: ${candidateImage}`);
            break;
          } catch {
            // Try next tutorial image candidate.
          }
        }

        if (!tutorialImageFound) {
          console.log(`[create] No tutorial image found for '${stackName}'. Falling back to tutorial source mount.`);

          if (fs.existsSync(tutorialBasePath) && fs.statSync(tutorialBasePath).isDirectory()) {
            const tutorialEntries = fs.readdirSync(tutorialBasePath, { withFileTypes: true });
            const preferredTutorialProject = tutorialEntries.find(
              (entry) => entry.isDirectory() && /to[-_ ]?do[-_ ]?list/i.test(entry.name),
            );

            const firstTutorialProject = preferredTutorialProject
              ?? tutorialEntries.find((entry) => entry.isDirectory());

            const mountPath = firstTutorialProject
              ? path.join(tutorialBasePath, firstTutorialProject.name)
              : tutorialBasePath;

            bindTargetConfig = `${mountPath}:/workspace`.replace(/\\/g, '/');
            console.log(`[create] Using tutorial bind mount: ${bindTargetConfig}`);
          }
        }
      } else {
        // Generate custom image name based on stack and scenario
        let customImageName = `devsim-project:${normalizedStackName}-${scenarioFolder}`;

        // If projectFolder is provided (e.g., LIBRARY_MANAGEMENT), add it to the image name
        if (req.projectFolder) {
          customImageName += `-${req.projectFolder.toLowerCase().replace(/[_ ]+/g, '-')}`;
        }

        try {
          await docker.getImage(customImageName).inspect();
          imageToUse = customImageName;
          console.log(`[create] Using custom image: ${imageToUse} (no volume)`);
        } catch {
          console.log(`[create] Custom image '${customImageName}' not found, falling back to default: ${imageToUse} (with volume/bind)`);
          try {
            await docker.getVolume(volumeName).inspect();
            volumeMountConfig = `${volumeName}:/workspace`;
            console.log(`[create] Using volume: ${volumeName}`);
          } catch {
            console.log(`[create] Volume '${volumeName}' not found, falling back to bind mount`);
            volumeMountConfig = `${process.cwd()}/submodules/projects/tech-stacks/${stackName}/${scenarioFolder}:/workspace`.replace(/\\/g, '/');
          }
        }
      }

      // Create the workspace container.
      // Ports 3000 (Express) and 5173 (Vite) are auto-assigned on the host (HostPort: '')
      // so the project can be previewed from the browser without using host networking,
      const containerConfig: any = {
        Image: imageToUse,
        name: `devsim-${stackName}-${userId}-${level}-${launchMode}`,
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
          // PostgreSQL initialization variables (required by postgres-entrypoint.sh)
          "POSTGRES_USER=devsim",
          "POSTGRES_PASSWORD=devsim",
          "POSTGRES_DB=devsim",
          // Application database connection variables
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
          'devsim.level': level.toString(),
          'devsim.mode': launchMode,
          'devsim.projectFolder': projectFolder ?? ''
        }
      };

      // Add bind/volume mounts when image fallback requires it.
      const binds = [volumeMountConfig, bindTargetConfig].filter((bind): bind is string => Boolean(bind));
      if (binds.length > 0) {
        containerConfig.HostConfig.Binds = binds;
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
        status: launchMode === 'tutorial' ? 'tutorial' : 'created'
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
