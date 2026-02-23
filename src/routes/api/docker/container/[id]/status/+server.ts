// src/routes/api/container/[id]/status/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getContainerById } from '$lib/server/docker/helpers/get-container-by-id';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const containerInstance = await getContainerById(params.id);

    if (!containerInstance.success || !containerInstance.container) {
      return json({ success: false, error: containerInstance.error || 'Container not found' }, { status: 404 });
    }
    const container = containerInstance.container;
    const info = await container.inspect();

    return json({
      success: true,
      running: info.State.Running,
      status: info.State.Status
    });
  } catch (error) {
    return json({ success: false, error: String(error) }, { status: 404 });
  }
};