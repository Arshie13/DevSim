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
import prisma from '$lib/server/client';
import { ContainerService } from '$lib/layers/service/ContainerService';

export const DELETE: RequestHandler = async ({ params, locals }) => {
  // --- Auth check ---
  const session = await locals.auth();
  if (!session?.user?.id) {
    return error(401, 'Unauthorized');
  }

  try {
    // --- Look up Container record in DB ---
    const record = await prisma.workspace.findUnique({
      where: { id: params.id }
    });

    if (!record) {
      return error(404, 'Container record not found.');
    }

    // --- Ownership check ---
    if (record.user_id !== session.user.id) {
      return error(403, 'You do not own this container.');
    }

    // --- Block deletion of completed-but-not-archived containers ---
    if (record.status === 'completed' && !record.is_archived) {
      return json(
        {
          success: false,
          error: 'Archive this container before deleting to preserve your progress.',
          archiveUrl: `/api/docker/container/${params.id}/archive`
        },
        { status: 409 }
      );
    }

    // --- Background cleanup: Docker stop/remove can be slow (5-10s).
    //     Chromium browsers fail slow localhost HTTPS requests with
    //     ERR_NETWORK_CHANGED. Respond immediately, clean up in background.
    const containerId = record.container_id;
    const isTutorial = record.status === 'tutorial';
    const recordId = record.id;
    const containerService = new ContainerService();

    const bgCleanup = async () => {
      try {
        await containerService.stopAndRemove(containerId);
        if (isTutorial) {
          // deleteMany is intentionally idempotent because another cleanup
          // request may have removed the row first.
          await prisma.workspace.deleteMany({ where: { id: recordId } });
        }
      } catch (err) {
        console.error('Background destroy error:', err);
      }
    };
    bgCleanup();

    return json({ success: true });
  } catch (err) {
    console.error('Error destroying container:', err);
    return json({ success: false, error: String(err) }, { status: 500 });
  }
};
