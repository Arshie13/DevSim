import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/client';
import { getProfileMetrics, getRivals } from '$lib/server/stats';
import { getTopAchievements } from '$lib/server/achievements/snapshots';
import { computeLevel } from '$lib/utils/level';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  const userSession = session?.user;

  if (!userSession || !userSession.id) {
    throw redirect(303, '/');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userSession.id },
    select: { image: true, coins: true, xp: true, owned_avatars: true, has_completed_tutorial: true, username: true },
  });

  const [metrics, rivals, topAchievements] = await Promise.all([
    getProfileMetrics(userSession.id),
    getRivals(userSession.id, dbUser?.xp ?? 0, 4),
    getTopAchievements(userSession.id, 3),
  ]);

  const levelData = computeLevel(dbUser?.xp ?? 0);

  return {
    user: {
      ...session.user,
      image: dbUser?.image ?? userSession.image,
      username: dbUser?.username,
      coins: dbUser?.coins ?? 0,
      xp: dbUser?.xp ?? 0,
      level: levelData.level,
      ownedAvatars: dbUser?.owned_avatars ?? [],
      hasCompletedTutorial: dbUser?.has_completed_tutorial ?? false,
    },
    userCoins: dbUser?.coins ?? 0,
    ownedAvatars: dbUser?.owned_avatars ?? [],
    metrics,
    rivals,
    topAchievements,
  };
};
