import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';

export const DELETE: RequestHandler = async ({ locals, params }) => {
  try {
    const session = await locals.auth();
    if (!session || !session.user || !session.user.id) {
      return error(401, 'Unauthorized');
    }

    const id = params.id;

    if (!id) {
      return error(400, 'Container ID is required');
    }

    const prismaContainer = await prisma.workspace.findFirst({
      where: {
        container_id: id
      },
      select: {
        id: true
      }
    });

    if (!prismaContainer) {
      return json({ success: true, data: { count: 0 } });
    }

    const res = await prisma.user_file_changes.deleteMany({
      where: {
        workspace_id: prismaContainer.id
      }
    });

    return json({ success: true, data: res });
  }
  catch {
    return error(500, 'Something went wrong when fetching all file logs');
  }
}