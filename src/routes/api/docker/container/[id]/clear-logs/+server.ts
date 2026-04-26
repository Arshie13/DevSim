import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WorkspaceService } from '$lib/layers/service/WorkspaceService';

export const DELETE: RequestHandler = async ({ locals, params }) => {
  try {
    const session = await locals.auth();
    if (!session || !session.user || !session.user.id) {
      return error(401, 'Unauthorized');
    }

    const id = params.id;

    if (!id) {
      return error(400, 'Container ID is required');
    }

    const workspaceService = new WorkspaceService();
    const res = await workspaceService.clearUserFileChanges({ workspaceId: id, dbContainerId: id });

    return json(res);
  }
  catch {
    return error(500, 'Something went wrong when fetching all file logs');
  }
}