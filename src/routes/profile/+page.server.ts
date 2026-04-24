import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/client';
import { getProfileMetrics, getRivals } from '$lib/server/stats';
import { getTopAchievements } from '$lib/server/achievements/snapshots';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, '/');
  }

  const [dbUser, metrics, rivals, topAchievements] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true, coins: true, xp: true, level: true, ownedAvatars: true, hasCompletedTutorial: true, username: true },
    }),
    getProfileMetrics(session.user.id),
    getRivals(session.user.id, 6),
    getTopAchievements(session.user.id, 3),
  ]);

  return {
    user: {
      ...session.user,
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
    metrics,
    rivals,
    topAchievements,
  };
};
