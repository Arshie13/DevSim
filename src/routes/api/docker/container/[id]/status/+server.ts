// src/routes/api/container/[id]/status/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { docker } from '$lib/server/docker/client';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const container = docker.getContainer(params.id);
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