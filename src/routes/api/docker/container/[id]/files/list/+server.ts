import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { docker } from '$lib/server/docker/client';
import { Writable } from 'stream';

export async function POST(event: RequestEvent) {
  try {
    const session = await event.locals.auth();
    if (!session?.user?.id) return error(401, 'Unauthorized');
    // Also validate user owns the container before allowing file operations

    const containerId = event.params.id as string;

    // Safely parse JSON with fallback
    let requestData = { path: '/workspace' };
    try {
      const body = await event.request.text();
      if (body) {
        requestData = JSON.parse(body);
      }
    } catch (parseError) {
      console.warn('Could not parse request body, using defaults:', parseError);
    }
    const path = requestData.path || '/workspace';
    const container = docker.getContainer(containerId);

    // Check if container exists and is running
    const info = await container.inspect();
    if (!info.State.Running) {
      return json({
        success: false,
        error: 'Container is not running',
        files: []
      });
    }
    const exec = await container.exec({
      Cmd: ['sh', '-c', `find ${path} -type f ! -path "*/node_modules/*" ! -path "*/.next/*" ! -path "*/.git/*" 2>/dev/null || echo ""`],
      AttachStdout: true,
      AttachStderr: true
    });
    const stream = await exec.start({});

    let output = '';
    let errorOutput = '';

    const stdout = new Writable({
      write(chunk, encoding, callback) {
        output += chunk.toString();
        callback();
      }
    });

    const stderr = new Writable({
      write(chunk, encoding, callback) {
        errorOutput += chunk.toString();
        callback();
      }
    });



    container.modem.demuxStream(stream, stdout, stderr);

    await new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
      setTimeout(() => reject(new Error('Timeout')), 20000); // 10s timeout
    });

    // Also list directories
    const dirExec = await container.exec({
      Cmd: ['sh', '-c', `find ${path} -type d ! -path "*/node_modules/*" ! -path "*/.next/*" ! -path "*/.git/*" ! -path "${path}$" 2>/dev/null || echo ""`],
      AttachStdout: true,
      AttachStderr: true
    });

    const dirStream = await dirExec.start({});

    let dirOutput = '';

    const dirStdout = new Writable({
      write(chunk, encoding, callback) {
        dirOutput += chunk.toString();
        callback();
      }
    });

    container.modem.demuxStream(dirStream, dirStdout, new Writable({ write: () => { } }));

    await new Promise((resolve, reject) => {
      dirStream.on('end', resolve);
      dirStream.on('error', reject);
      setTimeout(() => reject(new Error('Timeout')), 20000); // 10s timeout
    });

    if (errorOutput) {
      console.log('Stderr output:', errorOutput);
    }

    const files = output
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.startsWith('/workspace') && line !== '/workspace')
      .map(f => f.replace('/workspace/', ''));

    // Process directories
    const directories = dirOutput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.startsWith('/workspace') && line !== '/workspace')
      .map(f => f.replace('/workspace/', ''));

    // Combine files and directories, removing duplicates
    const allPaths = [...new Set([...files, ...directories])];

    return json({ success: true, files: allPaths, directories });
  } catch (error) {
    console.error('Error listing files:', error);
    return json({
      success: false,
      error: String(error),
      files: []
    }, { status: 500 });
  }
}