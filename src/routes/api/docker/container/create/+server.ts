// src/routes/api/container/create/+server.ts
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
    const { stackName, level, stacks, scenarioId, projectFolder } = req;

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

    return await createFreshContainer();

    async function createFreshContainer() {
      // Use the scenario folder name (e.g. "scenario-2") so each scenario gets its own
      // volume/bind-mount. Falling back to `scenario-${level}` keeps older containers working.
      const scenarioFolder = scenarioId ?? `scenario-${level}`;
      // Generate volume name: {stack-name}-{scenario-folder}
      const volumeName = `${stackName.toLowerCase().replace(/[_ ]+/g, '-')}-${scenarioFolder}`;

      // Check if volume exists
      let useVolume = false;
      let volumeMountConfig: string | null = null;

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

      const networkName = `devsim-${userId}-${level}`;

      try {
        await docker.getNetwork(networkName).inspect();
      } catch {
        await docker.createNetwork({ Name: networkName });
      }

      // Create the postgres container on the bridge network.
      // No ports are exposed to the host — only the workspace container needs access,
      // and it connects internally via the Docker bridge network using the "postgres" alias.
      const dbContainer = await docker.createContainer({
        Image: "postgres:16-alpine",
        name: `devsim-db-${userId}-${level}`,
        Env: [
          "POSTGRES_DB=devsim",
          "POSTGRES_USER=devsim",
          "POSTGRES_PASSWORD=devsim"
        ],
        HostConfig: {
          // NetworkMode removed — network.connect() below handles this with aliases
          RestartPolicy: { Name: "unless-stopped" }
        },
        Labels: {
          "devsim.userId": userId,
          "devsim.level": level.toString(),
          "devsim.type": "database",
        }
      });
      // Connect dbContainer to the network with aliases so the workspace container
      // can reach it via "postgres" or "database" hostnames.
      await docker.getNetwork(networkName).connect({
        Container: dbContainer.id,
        EndpointConfig: {
          Aliases: ["postgres", "database"]
        }
      });

      await docker.getContainer(dbContainer.id).start();

      // Wait for PostgreSQL to be ready before starting the workspace container
      console.log('[create] Waiting for PostgreSQL to be ready...');
      const maxRetries = 30;
      const retryInterval = 1000;
      let dbReady = false;

      for (let i = 0; i < maxRetries; i++) {
        try {
          const exec = await docker.getContainer(dbContainer.id).exec({
            Cmd: ['pg_isready', '-U', 'devsim', '-d', 'devsim'],
            AttachStdout: true,
            AttachStderr: true
          });
          const stream = await exec.start({ hijack: true, stdin: false });

          await new Promise<void>((resolve) => {
            let output = '';
            stream.on('data', (chunk: Buffer) => { output += chunk.toString(); });
            stream.on('end', () => {
              if (output.includes('accepting connections')) {
                dbReady = true;
              }
              resolve();
            });
          });

          if (dbReady) break;
        } catch {}
        await new Promise(r => setTimeout(r, retryInterval));
      }

      if (!dbReady) {
        console.warn('[create] PostgreSQL may not be fully ready, proceeding anyway...');
      } else {
        console.log('[create] PostgreSQL is ready!');
      }

      // Create the workspace container on the same bridge network.
      // Ports 3000 (Express) and 5173 (Vite) are auto-assigned on the host (HostPort: '')
      // so the project can be previewed from the browser without using host networking,
      // which would break the internal "postgres" DNS alias.
      const container = await docker.createContainer({
        Image: 'node:20-alpine',
        name: `devsim-${stackName}-${userId}-${level}`,
        Cmd: ['/bin/sh'],
        Tty: true,
        OpenStdin: true,
        WorkingDir: '/workspace',
        ExposedPorts: {
          '3000/tcp': {},
          '5173/tcp': {}
        },
        Env: [
          "DATABASE_HOST=postgres",
          "DATABASE_PORT=5432",
          "DATABASE_USER=devsim",
          "DATABASE_PASSWORD=devsim",
          "DATABASE_NAME=devsim",
          "DATABASE_URL=postgresql://devsim:devsim@postgres:5432/devsim"
        ],
        HostConfig: {
          NetworkMode: networkName,
          Binds: [volumeMountConfig],
          Memory: 512 * 1024 * 1024,
          AutoRemove: false,
          PortBindings: {
            '3000/tcp': [{ HostPort: '' }],  // auto-assigned free port
            '5173/tcp': [{ HostPort: '' }]   // auto-assigned free port
          }
        },
        Labels: {
          'devsim.userId': userId,
          'devsim.stack': stackName,
          'devsim.level': level.toString(),
          'devsim.projectFolder': projectFolder ?? ''
        }
      });

      // Connect workspace container to the network explicitly for reliable DNS resolution
      await docker.getNetwork(networkName).connect({
        Container: container.id,
        EndpointConfig: {
          Aliases: ["backend"]
        }
      });

      await docker.getContainer(container.id).start();

      // Retrieve the auto-assigned host ports for the preview URLs
      const containerInfo = await docker.getContainer(container.id).inspect();
      const assignedBackendPort = containerInfo.NetworkSettings.Ports['3000/tcp']?.[0]?.HostPort;
      const assignedFrontendPort = containerInfo.NetworkSettings.Ports['5173/tcp']?.[0]?.HostPort;
      console.log(`[create] Preview ports — backend: ${assignedBackendPort}, frontend: ${assignedFrontendPort}`);

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
          frontend: assignedFrontendPort
        }
      });
    }

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