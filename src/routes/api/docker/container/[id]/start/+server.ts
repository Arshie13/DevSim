import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WorkspaceService } from '$lib/layers/service/WorkspaceService';

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

    const isProduction = process.env.NODE_ENV === 'production';
    const username = session.user.name
      ? session.user.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      : session.user.id;

    const workspaceService = new WorkspaceService();
    const result = await workspaceService.startContainerForPreview({
      containerId: id,
      userId: session.user.id,
      isProduction,
      username,
    });

    return json({
      success: true,
      id: result.id,
      previewPorts: result.previewPorts,
      previewUrl: result.previewUrl,
    });
  } catch (err) {
    console.error('Error starting container:', err);
    return json({ success: false, error: String(err) }, { status: 500 });
    }
};
