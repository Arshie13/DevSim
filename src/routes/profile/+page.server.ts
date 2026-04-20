import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/client';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, '/');
  }

  // Always fetch the latest user data from the DB so changes are
  // immediately reflected without requiring a re-login.
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true, coins: true, xp: true, level: true, ownedAvatars: true, hasCompletedTutorial: true, username: true },
  });

  return {
    user: {
      ...session.user,
      // Override session values with live DB values
      image: dbUser?.image ?? session.user.image,
      username: dbUser?.username,
      coins: dbUser?.coins ?? 0,
      xp: dbUser?.xp ?? 0,
      level: dbUser?.level ?? 1,
      ownedAvatars: dbUser?.ownedAvatars ?? [],
      hasCompletedTutorial: dbUser?.hasCompletedTutorial ?? false,
    },
    userCoins: dbUser?.coins ?? 0,
    ownedAvatars: dbUser?.ownedAvatars ?? [],
  };
};
