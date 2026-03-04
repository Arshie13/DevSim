import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { docker } from '$lib/server/docker/client';

export const GET: RequestHandler = async ({ locals, params }) => {
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

    // Check if container is running
    if (!info.State.Running) {
      return json({
        success: false,
        error: 'Container is not running'
      }, { status: 400 });
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

    const host = '127.0.0.1';
    const firstPort = Object.values(previewPorts)[0];

    return json({
      success: true,
      ports: previewPorts,
      previewUrl: firstPort ? `http://${host}:${firstPort}` : null
    });
  } catch (err) {
    console.error('Error getting container ports:', err);
    return json({ success: false, error: String(err) }, { status: 500 });
  }
};
