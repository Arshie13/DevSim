import { json, type RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/server/client";
import { docker } from "$lib/server/docker/client";
import { error } from "@sveltejs/kit";
import { NgrokWrapper } from "$lib/wrapper/ngrok";

export const POST: RequestHandler = async ({ params, locals }) => {
    // --- Auth check ---
    const session = await locals.auth();
    if (!session?.user?.id) {
        return error(401, 'Unauthorized');
    }
    const { id } = params;
    const container = await prisma.container.findFirst({ where: { containerId: id } });

    if (!container) {
        return error(404, 'Container not found.');
    }

    await docker.getContainer(id).stop();
    const ngrok = new NgrokWrapper();
    await ngrok.disconnect(); // Ensure ngrok tunnel is closed when container stops

    await prisma.container.update({
        where: { id: container.id },
        data: {
            status: 'stopped',
            stoppedAt: new Date()
        }   
    });
    return json({success: true, })
}