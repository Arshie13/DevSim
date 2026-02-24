import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import prisma from '$lib/server/client';
import { docker } from '$lib/server/docker/client';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, '/');
  }

  const dockerContainerId = event.params.containerId;
  const userId = session.user.id;

  console.log('[page.server] dockerContainerId:', dockerContainerId, '| userId:', userId);

  // --- 1. Try to find an existing DB record ---
  let record = await prisma.container.findFirst({
    where: { containerId: dockerContainerId, userId },
    select: { id: true, containerId: true, status: true }
  });

  console.log('[page.server] DB record found:', record);

  // --- 2. No record found — inspect the Docker container and auto-create it ---
  // This recovers containers that were created before DB saving was wired up.
  if (!record) {
    try {
      const info = await docker.getContainer(dockerContainerId).inspect();
      const labels = info.Config.Labels ?? {};

      console.log('[page.server] Docker labels:', labels);

      // Only create the record if the container actually belongs to this user
      if (labels['devsim.userId'] === userId) {
        const stackName: string = labels['devsim.stack'] ?? '';
        const level: number = parseInt(labels['devsim.level'] ?? '1', 10);

        // Convert the stack name back to an array of tech names
        const stacks = stackName ? stackName.split('-') : [];

        const created = await prisma.container.create({
          data: {
            userId,
            containerId: dockerContainerId,
            stacks,
            level,
            status: 'created'
          },
          select: { id: true, containerId: true, status: true }
        });

        console.log('[page.server] Auto-created DB record:', created);
        record = created;
      } else {
        console.warn('[page.server] Container userId label mismatch — not auto-creating.');
      }
    } catch (err) {
      // Docker inspect failed (container gone, daemon down, etc.) — log and continue
      console.error('[page.server] Could not inspect Docker container:', err);
    }
  }

  return {
    user: session.user,
    dbContainerId: record?.id ?? null
  };
};
