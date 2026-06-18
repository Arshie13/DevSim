import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';

/**
 * GET /api/user/verify
 * Lightweight endpoint that verifies the session user still exists in the database.
 * Used by the client to detect stale sessions after DB resets or user deletion.
 */
export const GET: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    return json({ valid: false, error: 'No session' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });

  if (!user) {
    return json({ valid: false, error: 'User not found' }, { status: 401 });
  }

  return json({ valid: true });
};
