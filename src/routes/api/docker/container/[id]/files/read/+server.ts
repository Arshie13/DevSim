import { json, isHttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ContainerService } from '$lib/layers/service/ContainerService';
import { requireWorkspaceAccess, resolveWorkspacePath } from '$lib/server/docker/workspace-access';

export const POST: RequestHandler = async (event) => {
  try {
    // --- Auth + ownership ---
    const { containerId } = await requireWorkspaceAccess(event.locals, event.params.id);

    const { path } = await event.request.json();

    // Confined to /workspace, so `/etc/passwd`-style reads are rejected.
    const resolvedPath = resolveWorkspacePath(path);

    const service = new ContainerService();
    const { content } = await service.readFile(containerId, resolvedPath);

    return json({ success: true, content });
  } catch (err) {
    if (isHttpError(err)) {
      throw err;
    }
    console.error('Error reading file:', err);
    return json({ success: false, error: String(err) }, { status: 500 });
  }
};
