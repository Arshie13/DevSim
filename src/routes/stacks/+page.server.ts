import { getAllUserContainer } from '$lib/server/docker/user/get-user-container';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/client';
import { scanStacks } from '$lib/server/stacks/stack-scanner';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  const userData = session?.user;

  if (!userData || !userData.id) {
    throw redirect(303, '/');
  }

  const [userContainerList, dbUser, { techCategories, popularCombos }] = await Promise.all([
    getAllUserContainer(userData.id),
    prisma.user.findUnique({ where: { id: userData.id }, select: { coins: true, image: true } }),
    scanStacks(),
  ]);

  return {
    user: {
      ...session.user,
      image: dbUser?.image ?? userData.image,
    },
    userContainerList,
    userCoins: dbUser?.coins ?? 0,
    techCategories,
    popularCombos,
  };
};
