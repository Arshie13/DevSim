// src/routes/api/container/create/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Docker from 'dockerode';
import { LEVEL_CONFIG } from '$lib/mockdata/mocklevel';

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
    let isNew = false;

    if (existingContainers.length > 0) {
      console.log(`♻️ Reusing existing container: ${existingContainers[0].Id}`);
      container = docker.getContainer(existingContainers[0].Id);

      const info = await container.inspect();
      if (!info.State.Running) {
        await container.start();
      }
    } else {
      console.log(`🆕 Creating new container for ${stackId} level ${levelId}`);
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
          Memory: 512 * 1024 * 1024,
          AutoRemove: false
        },
        Labels: {
          'devsim.stack': stackId,
          'devsim.level': levelId.toString()
        }
      });
      await container.start();
      isNew = true;
    }

    // Get assigned ports
    const info = await container.inspect();
    const port3000 = info.NetworkSettings.Ports['3000/tcp']?.[0]?.HostPort || '3000';
    const port5173 = info.NetworkSettings.Ports['5173/tcp']?.[0]?.HostPort || '5173';

    // Check if project is initialized (package.json exists)
    let needsSetup = isNew;
    if (!isNew) {
      try {
        const checkExec = await container.exec({
          Cmd: ['ls', '/workspace/package.json'],
          AttachStdout: true,
          AttachStderr: true
        });
        const stream = await checkExec.start({ hijack: true });

        // Wait for it to finish
        await new Promise<void>((resolve) => {
          stream.on('data', () => { }); // Consume stream
          stream.on('end', resolve);
        });

        const inspect = await checkExec.inspect();
        if (inspect.ExitCode !== 0) {
          console.log(`🔍 package.json not found (exit ${inspect.ExitCode}), triggering setup`);
          needsSetup = true;
        }
      } catch (e) {
        console.error("🔍 Error checking for package.json:", e);
        needsSetup = true;
      }
    }

    // Setup files if needed
    if (needsSetup) {
      console.log(`🛠️ Setting up project files in container ${container.id}`);
      await setupProjectFiles(container, stackId, levelId);
    }

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

async function setupProjectFiles(container: Docker.Container, stackId: string, levelId: number) {
  const files = getStarterFiles(stackId, levelId);
  console.log(`📂 Preparing to write ${Object.keys(files).length} files to container ${container.id}`);

  for (const [path, content] of Object.entries(files)) {
    try {
      const exec = await container.exec({
        Cmd: ['sh', '-c', `mkdir -p $(dirname "${path}") && cat > "${path}"`],
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true
      });

      const stream = await exec.start({ hijack: true, stdin: true });

      await new Promise<void>((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
        stream.write(content);
        stream.end();
      });

      // Wait a bit for the filesystem to catch up
      const inspect = await exec.inspect();
      if (inspect.ExitCode !== 0) {
        console.error(`❌ Failed to write ${path}. Exit code: ${inspect.ExitCode}`);
      } else {
        console.log(`✅ Wrote ${path} (${content.length} bytes)`);
      }
    } catch (error) {
      console.error(`❌ Error writing ${path}:`, error);
    }
  }
}

function flattenStarterFiles(structure: any, prefix = '/workspace'): Record<string, string> {
  const files: Record<string, string> = {};

  for (const [key, value] of Object.entries(structure)) {
    const path = `${prefix}/${key}`;

    if (value && typeof value === 'object') {
      if ('file' in value) {
        files[path] = (value as any).file.contents;
      } else if ('directory' in value) {
        Object.assign(files, flattenStarterFiles((value as any).directory, path));
      }
    }
  }

  return files;
}

function getStarterFiles(stackId: string, levelId: number): Record<string, string> {
  // For now we only have one level in mocklevel, 
  // so we'll return it if levelId matches.
  if (levelId === LEVEL_CONFIG.level) {
    return flattenStarterFiles(LEVEL_CONFIG.starterFiles);
  }

  return {};
}
