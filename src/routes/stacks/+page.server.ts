import { getAllUserContainer } from '$lib/server/docker/user/get-user-container';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/client';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, '/');
  }

  const [userContainerList, dbUser] = await Promise.all([
    getAllUserContainer(session.user.id),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { coins: true, image: true } }),
  ]);

  return {
    user: {
      ...session.user,
      image: dbUser?.image ?? session.user.image,
    },
    userContainerList,
    userCoins: dbUser?.coins ?? 0,
  };
};
