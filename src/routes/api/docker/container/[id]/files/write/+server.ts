// src/routes/api/container/[id]/files/write/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { docker } from '$lib/server/docker/client';

export const POST: RequestHandler = async ({ params, request }) => {
  try {
    const { path, content } = await request.json();
    const container = docker.getContainer(params.id);

    const exec = await container.exec({
      Cmd: ['sh', '-c', `mkdir -p $(dirname ${path}) && cat > ${path}`],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true
    });

    const stream = await exec.start({ hijack: true, stdin: true });
    stream.write(content);
    stream.end();

    return json({ success: true });
  } catch (error) {
    console.error('Error writing file:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};

