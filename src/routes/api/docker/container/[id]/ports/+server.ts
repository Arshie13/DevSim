import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CloudflaredWrapper } from '$lib/wrapper/cloudflared';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    const session = await locals.auth();
    if (!session || !session.user || !session.user.id) {
      return error(401, 'Unauthorized');
    }

    const username = session.user.username ? 
    session.user.username.toLowerCase().replace(/[^a-z0-9-]/g, '-') :
    session.user.id // questionable fallback, but should always have username or id

    const cloudflared = new CloudflaredWrapper();

    const hostname = `${username}.devsim.dev`;

    let previewUrl = await cloudflared.getExistingRoute(hostname);

    console.log("preview url from ports server: ", hostname);

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
