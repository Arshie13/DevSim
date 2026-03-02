/**
 * DELETE /api/docker/container/[id]/destroy
 *
 * Stops and removes a Docker container.
 *
 * Guards:
 *  - Auth: session required, must own the container.
 *  - If the container is completed but NOT archived, returns 409 —
 *    forces the user to archive first so progress isn't lost.
 *
 * Params: [id] = Prisma Container.id
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { docker } from '$lib/server/docker/client';
import prisma from '$lib/server/client';

export const DELETE: RequestHandler = async ({ params, locals }) => {
  // --- Auth check ---
  const session = await locals.auth();
  if (!session?.user?.id) {
    return error(401, 'Unauthorized');
  }

  try {
    // --- Look up Container record in DB ---
    const record = await prisma.container.findUnique({
      where: { id: params.id }
    });

    if (!record) {
      return error(404, 'Container record not found.');
    }

    // --- Ownership check ---
    if (record.userId !== session.user.id) {
      return error(403, 'You do not own this container.');
    }

    // --- Block deletion of completed-but-not-archived containers ---
    if (record.status === 'completed' && !record.isArchived) {
      return json(
        {
          success: false,
          error: 'Archive this container before deleting to preserve your progress.',
          archiveUrl: `/api/docker/container/${params.id}/archive`
        },
        { status: 409 }
      );
    }

    // --- Stop and remove the Docker container ---
    const container = docker.getContainer(record.containerId);
    try {
      await container.stop({ t: 5 });
    } catch {
      /* container may already be stopped */
    }
    await container.remove();

    return json({ success: true });
  } catch (err) {
    console.error('Error destroying container:', err);
    return json({ success: false, error: String(err) }, { status: 500 });
  }
};
