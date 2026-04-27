import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WorkspaceService } from '$lib/layers/service/WorkspaceService';

const workspaceService = new WorkspaceService();

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

    const fileLogs = await workspaceService.getFileLogs(session.user.id, id);

    return json({ success: true, data: fileLogs });
  }
  catch {
    return error(500, 'Something went wrong when fetching all file logs');
  }
}
