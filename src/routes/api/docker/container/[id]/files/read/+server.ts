import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getContainerById } from '$lib/server/docker/helpers/get-container-by-id';
import { streamContainer } from '$lib/server/docker/helpers/stream';

export const POST: RequestHandler = async ({ params, request }) => {
  try {
    const { path } = await request.json();

    const containerInstance = await getContainerById(params.id);

    if (!containerInstance.success || !containerInstance.container) {
      return json({ success: false, error: containerInstance.error || 'Container not found' }, { status: 404 });
    }

    const container = containerInstance.container;

    const exec = await container.exec({
      Cmd: ['cat', path],
      AttachStdout: true,
      AttachStderr: true,
      Tty: false
    });

    const { output, errorOutput } = await streamContainer(exec, container);

    if (errorOutput) {
      console.error("Read error:", errorOutput);
      return json({ success: false, error: errorOutput.trim() });
    }

    return json({ success: true, content: output });
  } catch (error) {
    console.error('Error reading file:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};
