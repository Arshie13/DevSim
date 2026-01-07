// src/routes/api/container/[id]/files/list/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import Docker from 'dockerode';
import os from 'os';
import { Writable } from 'stream';

function getDockerConnection() {
  const platform = os.platform();
  if (platform === 'win32') return { socketPath: '//./pipe/docker_engine' };
  return { socketPath: '/var/run/docker.sock' };
}

const docker = new Docker(getDockerConnection());

export async function POST(event: RequestEvent) {
  try {
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
      setTimeout(() => reject(new Error('Timeout')), 10000); // 10s timeout
    });

    if (errorOutput) {
      console.log('Stderr output:', errorOutput);
    }

    const files = output
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.startsWith('/workspace'))
      .map(f => f.replace('/workspace/', ''));

    console.log(`Found ${files.length} files in container ${containerId}`);

    return json({ success: true, files });
  } catch (error) {
    console.error('Error listing files:', error);
    return json({ 
      success: false, 
      error: String(error),
      files: [] 
    }, { status: 500 });
  }
}