import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import { checkRateLimit } from '$lib/server/ratelimit';

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!checkRateLimit(`user:${session.user.id}`, 10, 60_000)) {
    return json({ error: 'Too many requests' }, { status: 429 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { last_seen_at: new Date() },
  });

  return json({ success: true });
};
