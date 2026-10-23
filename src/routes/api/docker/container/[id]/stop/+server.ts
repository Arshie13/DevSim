import { json, isHttpError, type RequestHandler } from '@sveltejs/kit';
import { WorkspaceService } from '$lib/layers/service/WorkspaceService';
import { requireWorkspaceAccess } from '$lib/server/docker/workspace-access';

const workspaceService = new WorkspaceService();

export const POST: RequestHandler = async ({ params, locals }) => {
  try {
    // --- Auth + ownership ---
    const { containerId } = await requireWorkspaceAccess(locals, params.id);

    const res = await workspaceService.stopWorkspace(containerId);

    return json({ success: true, data: res });
  } catch (error) {
    if (isHttpError(error)) {
      throw error;
    }
    console.error('Error stopping container:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};
