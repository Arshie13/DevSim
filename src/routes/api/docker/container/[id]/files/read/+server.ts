import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { docker } from '$lib/server/docker/client';

export const POST: RequestHandler = async ({ locals, params, request }) => {
  try {
    const session = await locals.auth();
    if (!session?.user?.id) return error(401, 'Unauthorized');
    
    // Also validate user owns the container before allowing file operations
    // FIX #6: Add input validation for path
    const { path } = await request.json();

    if (!path || typeof path !== 'string') {
      return json({ success: false, error: 'Path is required' }, { status: 400 });
    }

    // Validate path to prevent path traversal attacks
    // Only allow paths starting with /workspace and no ../ sequences
    if (!path.startsWith('/workspace/') || path.includes('..')) {
      return json({ success: false, error: 'Invalid path' }, { status: 400 });
    }

    const container = docker.getContainer(params.id);

    const exec = await container.exec({
      Cmd: ['cat', path],
      AttachStdout: true,
      AttachStderr: true,
      Tty: false
    });

    const stream = await exec.start({ hijack: true });

    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      container.modem.demuxStream(
        stream,
        {
          write: (chunk: Buffer) => stdout.push(chunk),
          end: () => { }
        },
        {
          write: (chunk: Buffer) => stderr.push(chunk),
          end: () => { }
        }
      );

      stream.on('end', resolve);
      stream.on('error', reject);
    });

    // FIX #6: Handle empty content case
    const content = Buffer.concat(stdout).toString('utf8');
    const errorOutput = Buffer.concat(stderr).toString('utf8');

    // Check for errors first
    if (errorOutput && !content) {
      console.error("Read error:", errorOutput);
      return json({ success: false, error: errorOutput.trim() });
    }

    // Handle empty file case - return empty string instead of undefined
    return json({ success: true, content: content || '' });
  } catch (error) {
    console.error('Error reading file:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};
