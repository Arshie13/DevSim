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
      console.log(`♻️ Container already running: ${id}`);
    }

    // Get all assigned ports from NetworkSettings
    const ports = info.NetworkSettings.Ports;
    const previewPorts: Record<string, number> = {};
    
    // Iterate through all exposed ports and get their host bindings
    for (const [containerPort, hostBindings] of Object.entries(ports || {})) {
      if (hostBindings && hostBindings.length > 0) {
        const hostPort = hostBindings[0]?.HostPort;
        if (hostPort) {
          // Use the container port number (e.g., "3000/tcp" -> "3000") as key
          const portKey = containerPort.split('/')[0];
          previewPorts[portKey] = parseInt(hostPort);
        }
      }
    }

    // Get host from request
    const host = '127.0.0.1'; // Default for container access

    // Use the first available port for preview, or default to 3000
    const firstPort = Object.values(previewPorts)[0] || 3000;

    return json({
      success: true,
      id,
      previewPorts,
      previewUrl: `http://${host}:${firstPort}`
    });
  } catch (error) {
    console.error('Error starting container:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};
