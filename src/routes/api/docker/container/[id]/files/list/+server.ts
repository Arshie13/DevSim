import { json, isHttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ContainerService } from '$lib/layers/service/ContainerService';
import { requireWorkspaceAccess, resolveWorkspacePath } from '$lib/server/docker/workspace-access';

export const POST: RequestHandler = async (event) => {
  try {
    // --- Auth + ownership ---
    const { containerId } = await requireWorkspaceAccess(event.locals, event.params.id);

    // Safely parse JSON with fallback
    let requestData: { path?: unknown } = {};
    try {
      const body = await event.request.text();
      if (body) {
        requestData = JSON.parse(body);
      }
    } catch (parseError) {
      console.warn('Could not parse request body, using defaults:', parseError);
    }

    // Confined to /workspace and passed to `find` as argv, never a shell string.
    const path = requestData.path ? resolveWorkspacePath(requestData.path) : '/workspace';

    const service = new ContainerService();
    const { files, directories } = await service.listFiles(containerId, path);

    return json({ success: true, files, directories });
  } catch (err) {
    if (isHttpError(err)) {
      throw err;
    }
    console.error('Error listing files:', err);
    return json({
      success: false,
      error: String(err),
      files: [],
      directories: []
    }, { status: 500 });
  }
};
