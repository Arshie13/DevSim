// src/routes/api/container/[id]/files/list/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getContainerById } from '$lib/server/docker/helpers/get-container-by-id';
import { streamContainer } from '$lib/server/docker/helpers/stream';

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
    const containerInstance = await getContainerById(containerId);

    if (!containerInstance.success || !containerInstance.container) {
      return json({ success: false, error: containerInstance.error || 'Container not found', files: [] }, { status: 404 });
    }

    const container = containerInstance.container;

    const exec = await container.exec({
      Cmd: ['sh', '-c', `find ${path} -type f ! -path "*/node_modules/*" ! -path "*/.next/*" ! -path "*/.git/*" 2>/dev/null || echo ""`],
      AttachStdout: true,
      AttachStderr: true
    });

    const { output, errorOutput } = await streamContainer(exec, container);

    if (errorOutput) {
      console.log('Stderr output:', errorOutput);
      return json({
        success: false,
        error: `Error executing command: ${errorOutput.trim()}`,
        files: []
      })
    }

    const files = output
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.startsWith('/workspace'))
      .map(f => f.replace('/workspace/', ''));

    return json({ success: true, files });
  } catch (error) {
    console.error('Error listing files:', error);
    return json({ 
      success: false, 
      error: String(error),
      files: [] 
    }, { status: 500 });
  }
}