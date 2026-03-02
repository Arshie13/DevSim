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
}

export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    const session = await locals.auth();
    if (!session || !session.user || !session.user.id) {
      return error(401, 'Unauthorized');
    }

    const userId = session.user.id;

    // Guard: verify the user actually exists in the DB before touching Docker or writing
    // any records. A stale session (e.g. after a DB reset) has a valid JWT with a userId
    // that no longer exists, which would cause a FK violation after the container is
    // already created. Catching it here prevents any side effects.
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
    const { stackName, level, stacks } = req;

    // Build the canonical stacks array early — needed for both DB lookup and creation.
    const stacksArray: string[] = [
      stacks.frontend,
      stacks.backend,
      stacks.database,
      stacks.services
    ].filter((s): s is string => s !== null && s !== undefined);

    // --- DB-first lookup for an existing active container ---
    // Checking the DB first is more reliable than matching Docker labels because:
    //  • Restored containers have labels built from DB stacks (raw IDs, e.g. "postgresql")
    //    while buildStackName() maps them to folder names (e.g. "postgres"), causing mismatches.
    //  • A container created before DB tracking was introduced may have no DB record anyway.
    // Only non-archived containers are reusable (archived ones have no running Docker container).
    const existingDbContainer = await prisma.container.findFirst({
      where: {
        userId,
        level,
        isArchived: false,
        stacks: { equals: stacksArray }
      }
    });

    if (existingDbContainer) {
      const existingDockerContainerId = existingDbContainer.containerId;
      try {
        const existingContainer = docker.getContainer(existingDockerContainerId);
        const info = await existingContainer.inspect();
        if (!info.State.Running) {
          await existingContainer.start();
        }
        console.log('[create] DB-first: reusing existing container:', existingDockerContainerId);
      } catch {
        // The Docker container no longer exists (e.g. was deleted outside the app).
        // Fall through to create a fresh one and update the DB record.
        console.warn('[create] DB record found but Docker container is gone — creating fresh container.');
        return await createFreshContainer();
      }

      return json({
        success: true,
        message: 'Container already exists. Reusing...',
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
        stacks: stacksArray,
        level,
        status: 'created'
      });
      console.log('[create] Docker-label fallback: reusing container, DB upserted:', existingContainerId);
      return json({
        success: true,
        message: 'Container already exists. Reusing...',
        containerId: existingContainerId,
        dbContainerId: existingDbId
      });
    }

    if (dockerMatch && !dockerMatchDbRecord) {
      console.log('[create] Docker container found by label but no DB record — restore in progress. Creating fresh container.');
    }

    return await createFreshContainer();

    async function createFreshContainer() {
      const container = await docker.createContainer({
        Image: 'node:20-alpine',
        Cmd: ['/bin/sh'],
        Tty: true,
        OpenStdin: true,
        WorkingDir: '/workspace',
        ExposedPorts: {
          '3000/tcp': {},
          '5173/tcp': {}
        },
        HostConfig: {
          PortBindings: {
            '3000/tcp': [{ HostPort: '0' }],
            '5173/tcp': [{ HostPort: '0' }]
          },
          Binds: [
            `${process.cwd()}/submodules/projects/tech-stacks/${stackName}/scenario-${level}:/workspace`.replace(/\\/g, '/')
          ],
          Memory: 512 * 1024 * 1024,
          AutoRemove: false
        },
        Labels: {
          'devsim.userId': userId,
          'devsim.stack': stackName,
          'devsim.level': level.toString()
        }
      });

      await docker.getContainer(container.id).start();

      const userContainer: UserContainerRequest = {
        userId,
        containerId: container.id,
        stacks: stacksArray,
        level,
        status: 'created'
      };

      const { dbContainerId } = await saveUserContainer(userContainer);
      console.log('[create] Created fresh container:', container.id);
      return json({
        success: true,
        containerId: container.id,
        dbContainerId
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
