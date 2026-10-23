// src/routes/api/container/[id]/status/+server.ts
import { json, isHttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { docker } from '$lib/server/docker/client';
import { requireWorkspaceAccess } from '$lib/server/docker/workspace-access';

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    // --- Auth + ownership ---
    const { containerId } = await requireWorkspaceAccess(locals, params.id);

    const container = docker.getContainer(containerId);
    const info = await container.inspect();

    return json({
      success: true,
      running: info.State.Running,
      status: info.State.Status
    });
  } catch (error) {
    if (isHttpError(error)) {
      throw error;
    }
    return json({ success: false, error: String(error) }, { status: 404 });
  }
};
