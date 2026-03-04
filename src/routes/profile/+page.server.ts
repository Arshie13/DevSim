import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/client';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, '/');
  }

  // Always fetch the latest image from the DB so avatar changes are
  // immediately reflected without requiring a re-login.
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true, coins: true },
  });

  return {
    user: {
      ...session.user,
      // Override session image with live DB value
      image: dbUser?.image ?? session.user.image,
    },
    userCoins: dbUser?.coins ?? 0,
  };
};
