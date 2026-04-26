import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/client';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, '/');
  }

  const dbId = event.params.containerId;
  const userId = session.user.id;

  const [dbUser, container] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, coins: true, name: true, username: true },
    }),
    prisma.workspace.findFirst({
      where: { id: dbId, user_id: userId },
      include: {
        workspace_stacks: true,
        scenario: true,
      },
    }),
  ]);

  if (!container) {
    throw redirect(303, '/scenario');
  }

  if (container.status !== 'tutorial') {
    throw redirect(303, `/workspace/${container.id}`);
  }

  return {
    user: session.user,
    userId: dbUser?.id || '',
    userCoins: dbUser?.coins || 0,
    container,
  };
};
