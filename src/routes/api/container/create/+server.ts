// src/routes/api/container/create/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Docker from 'dockerode';

const docker = new Docker();

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { stackId, levelId } = await request.json();

    // Look for existing container with these labels
    const existingContainers = await docker.listContainers({
      all: true,
      filters: JSON.stringify({
        label: [
          `devsim.stack=${stackId}`,
          `devsim.level=${levelId}`
        ]
      })
    });

    let container: Docker.Container;

    if (existingContainers.length > 0) {
      console.log(`♻️ Reusing existing container: ${existingContainers[0].Id}`);
      container = docker.getContainer(existingContainers[0].Id);

      const info = await container.inspect();
      if (!info.State.Running) {
        await container.start();
      }
    } else {
      console.log(`🆕 Creating new container for ${stackId} level ${levelId}`);

      // use this for later for mounting a volume on a container
      // const volume = await docker.createVolume({
      //   Name: "test-volume",
      //   Driver: "local"
      // });

      container = await docker.createContainer({
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
            // volume_name: /directory for terminal
            "nextjs_scenario_1:/workspace"
          ],
          Memory: 512 * 1024 * 1024,
          AutoRemove: false
        },
        Labels: {
          'devsim.stack': stackId,
          'devsim.level': levelId.toString()
        }
      });
      await container.start();
    }

    // Get assigned ports
    const info = await container.inspect();
    const port3000 = info.NetworkSettings.Ports['3000/tcp']?.[0]?.HostPort || '3000';
    const port5173 = info.NetworkSettings.Ports['5173/tcp']?.[0]?.HostPort || '5173';

    // TODO: Check if project is initialized (has files)

    let host = new URL(request.url).hostname;
    if (host === 'localhost') host = '127.0.0.1';

    return json({
      success: true,
      containerId: container.id,
      previewPorts: {
        nextjs: parseInt(port3000),
        vite: parseInt(port5173)
      },
      previewUrl: `http://${host}:${port3000}`
    });
  } catch (error) {
    console.error('Error handling container request:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};
