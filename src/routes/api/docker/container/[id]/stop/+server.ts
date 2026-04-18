import { json, type RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/server/client";
import { docker } from "$lib/server/docker/client";
import { error } from "@sveltejs/kit";

async function stopContainerAsync(containerId: string, workspaceId: string) {
  try {
    await docker.getContainer(containerId).stop();
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        status: 'stopped',
        stoppedAt: new Date()
      }
    });
  } catch (err) {
    console.error('Background container stop failed:', err);
  }
}

export const POST: RequestHandler = async ({ params, locals }) => {
    // --- Auth check ---
    const session = await locals.auth();
    if (!session?.user?.id) {
        return error(401, 'Unauthorized');
    }
    const { id } = params;
    const container = await prisma.workspace.findFirst({ where: { containerId: id } });

    if (!container) {
        return error(404, 'Container not found.');
    }

    // Fire and forget - stop in background
    stopContainerAsync(id, container.id);
    
    return json({ success: true });
}
