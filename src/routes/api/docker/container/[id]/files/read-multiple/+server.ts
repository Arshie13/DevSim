import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { docker } from '$lib/server/docker/client';
import { type ReadFilesResponse } from '$lib/contracts/response/ReadFilesResponse';

/**
 * Reads multiple files from a Docker container
 * Request body: { paths: string[] }
 * Response: ReadFilesResponse
 */
export const POST: RequestHandler = async ({ params, request }) => {
  try {
    const { paths } = await request.json();

    if (!Array.isArray(paths)) {
      return json({ success: false, error: 'paths must be an array' }, { status: 400 });
    }

    const container = docker.getContainer(params.id);

    // Helper function to read a single file
    const readFile = async (filePath: string): Promise<{ path: string; content: string; error?: string }> => {
      try {
        const exec = await container.exec({
          Cmd: ['cat', filePath],
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

        const content = Buffer.concat(stdout).toString('utf8');
        const errorOutput = Buffer.concat(stderr).toString('utf8');

        if (errorOutput && !content) {
          return { path: filePath, content, error: errorOutput.trim() };
        }

        return { path: filePath, content };
      } catch (error) {
        return { path: filePath, content: '', error: String(error) };
      }
    };

    // Read all files sequentially to avoid any potential race conditions
    const results: ReadFilesResponse['files'] = [];
    for (const filePath of paths) {
      const file = await readFile(filePath);
      results.push(file);
    }

    return json({ success: true, files: results } as ReadFilesResponse);
  } catch (error) {
    console.error('Error reading files:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};
