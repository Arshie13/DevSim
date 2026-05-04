// src/routes/api/container/[id]/files/list/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ContainerService } from '$lib/layers/service/ContainerService';

export async function POST(event: RequestEvent) {
  try {
    const containerId = event.params.id as string;
    
    // Safely parse JSON with fallback
    let requestData = { path: '/workspace' };
    try {
      const body = await event.request.text();
      if (body) {
        requestData = JSON.parse(body);
      }
    } catch (parseError) {
      console.warn('Could not parse request body, using defaults:', parseError);
    }
    const path = requestData.path || '/workspace';

    const service = new ContainerService();
    const { files, directories } = await service.listFiles(containerId, path);

    return json({ success: true, files, directories });
  } catch (error) {
    console.error('Error listing files:', error);
    return json({ 
      success: false, 
      error: String(error),
      files: [],
      directories: [] 
    }, { status: 500 });
  }
}
