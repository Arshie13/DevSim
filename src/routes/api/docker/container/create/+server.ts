// src/routes/api/container/create/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Docker from 'dockerode';
import { saveUserContainer, type UserContainerRequest } from '$lib/server/docker/save-user-container'

const docker = new Docker();

export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    const session = await locals.auth();
    if (!session || !session.user || !session.user.id) {
      return error(401, 'Unauthorized');
    }
    const { stackName, level, stacks } = await request.json(); // needs a type uwu

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
      return json({
        success: true,
        error: 'Container already exists. Reusing...'
      });
    } else {

      //TODO: check first if selected stackname and scenario exists in submodules
      // otherwise it will create a container with no files in it.
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

      await saveUserContainer(userContainer)
    }

    return json({
      success: true,
      containerId
    });
  } catch (error) {
    console.error('Error handling container request:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};
