// src/routes/api/container/[id]/destroy/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Docker from 'dockerode';

const docker = new Docker();

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const container = docker.getContainer(params.id);
    
    // Stop and remove container
    await container.stop({ t: 5 }); // 5 second timeout
    await container.remove();

    return json({ success: true });
  } catch (error) {
    console.error('Error destroying container:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};
