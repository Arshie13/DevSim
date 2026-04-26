import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ContainerService } from '$lib/layers/service/ContainerService';

export const POST: RequestHandler = async ({ params, request }) => {
  try {
    const { path } = await request.json();
    const containerId = params.id;

    const service = new ContainerService();
    const { content } = await service.readFile(containerId, path);

    return json({ success: true, content });
  } catch (error) {
    console.error('Error reading file:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};
