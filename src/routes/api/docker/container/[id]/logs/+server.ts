import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';

export const GET: RequestHandler = async ({ locals, params }) => {
  try {
    const session = await locals.auth();
    if (!session || !session.user || !session.user.id) {
      return error(401, 'Unauthorized');
    }

    const id = params.id;

    if (!id) {
      return error(400, 'Container ID is required');
    }

    const fileLogs = await prisma.fileChange.findMany({
      where: {
        containerId: id
      },
      select: {
        filePath: true,
      }
    });

    return json({ success: true, data: fileLogs });
  }
  catch {
    return error(500, 'Something went wrong when fetching all file logs');
  }
}
