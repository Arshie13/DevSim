import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Docker from 'dockerode';

const docker = new Docker();

export const POST: RequestHandler = async ({ params, request }) => {
  try {
    const { path } = await request.json();
    const container = docker.getContainer(params.id);

    const exec = await container.exec({
      Cmd: ['cat', path],
      AttachStdout: true,
      AttachStderr: true
    });

    const stream = await exec.start({ hijack: true });
    
    // Use dockerode's demux to properly handle the stream
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    
    await new Promise<void>((resolve, reject) => {
      container.modem.demuxStream(
        stream,
        {
          write: (chunk: Buffer) => stdout.push(chunk),
          end: () => {}
        },
        {
          write: (chunk: Buffer) => stderr.push(chunk),
          end: () => {}
        }
      );
      
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    const content = Buffer.concat(stdout).toString('utf8');

    console.log("content: ", content);

    return json({ success: true, content });
  } catch (error) {
    console.error('Error reading file:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};