import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { docker } from '$lib/server/docker/client';

export const POST: RequestHandler = async ({ locals, params }) => {
  try {
    const session = await locals.auth();
    if (!session || !session.user || !session.user.id) {
      return error(401, 'Unauthorized');
    }

    const id = params.id;

    if (!id) {
      return error(400, 'Container ID is required');
    }

    const container = docker.getContainer(id);

    // Check if container exists and belongs to user
    const info = await container.inspect();

    if (info.Config.Labels['devsim.userId'] !== session.user.id) {
      return error(403, 'Container does not belong to user');
    }

    // Start the container if not already running
    if (!info.State.Running) {
      await container.start();
    } else {
      console.log(`♻️ Container already running!`);
    }

    // Get assigned ports
    const port3000 = info.NetworkSettings.Ports['3000/tcp']?.[0]?.HostPort || '3000';
    const port5173 = info.NetworkSettings.Ports['5173/tcp']?.[0]?.HostPort || '5173';

    // Get host from request
    const host = '127.0.0.1'; // Default for container access

    return json({
      success: true,
      id,
      previewPorts: {
        nextjs: parseInt(port3000),
        vite: parseInt(port5173)
      },
      previewUrl: `http://${host}:${port3000}`
    });
  } catch (error) {
    console.error('Error starting container:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};
