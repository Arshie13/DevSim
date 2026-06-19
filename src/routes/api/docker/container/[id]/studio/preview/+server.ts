import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { docker } from '$lib/server/docker/client';
import { CloudflaredWrapper } from '$lib/wrapper/cloudflared';

export const GET: RequestHandler = async ({ locals, params }) => {
  try {
    const session = await locals.auth();
    if (!session?.user?.id) {
      return error(401, 'Unauthorized');
    }

    const id = params.id;
    if (!id) {
      return error(400, 'Container ID is required');
    }

    const username = session.user.name
      ? session.user.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      : session.user.id;

    const container = docker.getContainer(id);
    const info = await container.inspect();

    if (!info.State.Running) {
      return json({ success: false, error: 'Container is not running' }, { status: 400 });
    }

    const ports = info.NetworkSettings.Ports;
    const studioBinding = ports?.['51212/tcp'];
    const hostPort = studioBinding?.[0]?.HostPort;

    if (!hostPort) {
      return json({
        success: false,
        error: 'Port 51212 is not published on this container. Prisma Studio may not be supported for this workspace.'
      }, { status: 400 });
    }

    let studioUrl: string;
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      const studioHostname = `studio-${username}.devsim.dev`;
      const cloudflared = new CloudflaredWrapper();
      studioUrl = await cloudflared.createRoute(studioHostname, parseInt(hostPort));
    } else {
      studioUrl = `http://127.0.0.1:${hostPort}`;
    }

    return json({ success: true, studioUrl });
  } catch (err) {
    console.error('Error getting Prisma Studio preview:', err);
    return json({ success: false, error: String(err) }, { status: 500 });
  }
};
