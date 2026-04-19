import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { docker } from '$lib/server/docker/client';
import { pickPreviewHostPortWithProbe } from '$lib/server/docker/preview-port';
import { CloudflaredWrapper } from '$lib/wrapper/cloudflared';

export const POST: RequestHandler = async ({ locals, params }) => {
  try {

    const isProduction = process.env.NODE_ENV === 'production';

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
    let info = await container.inspect();

    if (info.Config.Labels['devsim.userId'] !== session.user.id) {
      return error(403, 'Container does not belong to user');
    }

    // Start the container if not already running
    if (!info.State.Running) {
      await container.start();
      // Re-inspect after starting to get fresh port information
      info = await container.inspect();
    } else {
      console.log(`♻️ Container already running!`);
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

    const username = session.user.name ? 
    session.user.name.toLowerCase().replace(/[^a-z0-9-]/g, '-') :
    session.user.id // questionable fallback, but should always have username or id
    
    const hostPort = await pickPreviewHostPortWithProbe(previewPorts, { timeoutMs: 1000 });
    if (hostPort == null) {
      return json(
        {
          success: false,
          error:
            'No published preview ports found for this container. Ensure the workspace image exposes 5173, 3000, or 5000.',
        },
        { status: 400 },
      );
    }

    if (isProduction) {
      const cloudflared = new CloudflaredWrapper();
      const prodHostname = `${username}.devsim.dev`;
      
      let prodPreviewUrl = await cloudflared.createRoute(prodHostname, hostPort);
      
      return json({
        success: true,
        id,
        previewPorts,
        previewUrl: prodPreviewUrl,
      });
    }
    
    const devHostname = `http://127.0.0.1:${hostPort}`;

    return json({
      success: true,
      id,
      previewPorts,
      previewUrl: devHostname,
    })

  } catch (error) {
    console.error('Error starting container:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};
