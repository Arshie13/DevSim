import { docker } from "$lib/server/docker/client";
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
  const session = await locals.auth();
  if (!session || !session.user || !session.user.id) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
  }

  const containerId = params.id;

  try {
    const container = docker.getContainer(containerId);
    await container.stop();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Error stopping container:', err);
    return new Response(JSON.stringify({ success: false, error: 'Failed to stop container' }), { status: 500 });
  }
};
