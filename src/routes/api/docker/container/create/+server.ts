// src/routes/api/container/create/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveUserContainer, type UserContainerRequest } from '$lib/server/docker/user/save-user-container'
import { docker } from '$lib/server/docker/client';

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
    
    const req: CreateContainerRequest = await request.json()
    const { stackName, level, stacks } = req;

    // Look for existing container with these labels
    const existingContainers = await docker.listContainers({
      all: true,
      filters: JSON.stringify({
        label: [
          `devsim.userId=${session.user.id}`,
          `devsim.stack=${stackName}`,
          `devsim.level=${level}`
        ]
      })
    });

    let containerId: string;

    if (existingContainers.length > 0) {
      const existingContainerId = existingContainers[0].Id;
      
      // Check if container is not running, start it
      if (existingContainers[0].State !== 'running') {
        const existingContainer = docker.getContainer(existingContainerId);
        await existingContainer.start();
      }

      // Always upsert the DB record so the workspace page can resolve it.
      // This handles containers that existed before DB saving was introduced.
      const stacksArray: string[] = [
        stacks.frontend,
        stacks.backend,
        stacks.database,
        stacks.services
      ].filter((s): s is string => s !== null && s !== undefined);

      const { dbContainerId: existingDbId } = await saveUserContainer({
        userId: session.user.id,
        containerId: existingContainerId,
        stacks: stacksArray,
        level,
        status: 'created'
      });

      console.log('[create] Reusing existing container, DB record upserted:', existingContainerId);
      
      // Return both IDs — frontend navigates via DB id
      return json({
        success: true,
        message: 'Container already exists. Reusing...',
        containerId: existingContainerId,
        dbContainerId: existingDbId
      });
    } else {
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
            `${process.cwd()}/submodules/projects/tech-stacks/${stackName}/scenario-${level}:/workspace`
          ],
          Memory: 512 * 1024 * 1024,
          AutoRemove: false
        },
        Labels: {
          'devsim.userId': session.user.id,
          'devsim.stack': stackName,
          'devsim.level': level.toString()
        }
      });

      containerId = container.id;

      // Start the container
      const startedContainer = docker.getContainer(containerId);
      await startedContainer.start();

      // Convert stacks object to array of strings
      const stacksArray: string[] = [
        stacks.frontend,
        stacks.backend,
        stacks.database,
        stacks.services
      ].filter((s): s is string => s !== null && s !== undefined);

      const userContainer: UserContainerRequest = {
        userId: session.user.id,
        containerId: container.id,
        stacks: stacksArray,
        level: level,
        status: 'created'
      };

      const { dbContainerId } = await saveUserContainer(userContainer);
      return json({
        success: true,
        containerId,
        dbContainerId
      });
    }

    // Fallback (should not be reached)
    return json({ success: false, error: 'Unexpected state' }, { status: 500 });
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
