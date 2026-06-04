import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CloudflaredWrapper } from '$lib/wrapper/cloudflared';
import { docker } from '$lib/server/docker/client';
import { pickPreviewHostPortWithProbe } from '$lib/server/docker/preview-port';

export const GET: RequestHandler = async ({ locals, params }) => {
  try {
    const session = await locals.auth();
    if (!session || !session.user || !session.user.id) {
      return error(401, 'Unauthorized');
    }

    const isProduction = process.env.NODE_ENV === 'production';

    // if not in production, return localhost preview URL without checking cloudflared, since it won't be running in development
    if (!isProduction) {
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

      const hostPort = await pickPreviewHostPortWithProbe(previewPorts, { timeoutMs: 1000 });
      if (hostPort == null) {
        return json(
          {
            success: false,
            error:
              'No published preview ports found. Start the dev server in the terminal, then refresh preview.',
          },
          { status: 400 },
        );
      }

      return json({
        success: true,
        previewUrl: `http://127.0.0.1:${hostPort}`,
      });
    }

    const username = session.user.name ?
      session.user.name.toLowerCase().replace(/[^a-z0-9-]/g, '-') :
      session.user.id // questionable fallback, but should always have username or id

    const cloudflared = new CloudflaredWrapper();

    const hostname = `${username}.devsim.dev`;

    let previewUrl = await cloudflared.getExistingRoute(hostname);

    if (!previewUrl) {
      return json({
        success: false,
        error: 'No active preview URL found for this container. Please restart the container to create a preview URL.'
      })
    }

    return json({
      success: true,
      previewUrl: hostname
    });
  } catch (err) {
    console.error('Error getting container ports:', err);
    return json({ success: false, error: String(err) }, { status: 500 });
  }
};
