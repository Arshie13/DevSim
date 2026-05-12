import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/client';
import { getProfileMetrics, getRivals } from '$lib/server/stats';
import { getTopAchievements } from '$lib/server/achievements/snapshots';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  const userSession = session?.user;

  if (!userSession || !userSession.id) {
    throw redirect(303, '/');
  }

  // Resolve the canonical DB row by id, falling back to email. The fallback
  // protects against stale JWT cookies whose token.id no longer matches a row
  // (e.g. after a DB reseed) — without it, downstream lookups silently miss
  // and the share link points to a non-existent user.
  const userSelect = {
    id: true,
    image: true,
    coins: true,
    xp: true,
    level: true,
    owned_avatars: true,
    has_completed_tutorial: true,
    username: true,
    profile_share_id: true,
  } as const;

  // Resolve the canonical DB row by id, falling back to email. The fallback
  // protects against stale JWT cookies whose token.id no longer matches a row
  // (e.g. after a DB reseed) — without it, downstream lookups silently miss.
  let dbUser = await prisma.user.findUnique({ where: { id: userSession.id }, select: userSelect });
  if (!dbUser && userSession.email) {
    dbUser = await prisma.user.findUnique({ where: { email: userSession.email }, select: userSelect });
  }

  const canonicalId = dbUser?.id ?? userSession.id;

  const [metrics, rivals, topAchievements] = await Promise.all([
    getProfileMetrics(canonicalId),
    getRivals(canonicalId, 6),
    getTopAchievements(canonicalId, 3),
  ]);

  return {
    user: {
      ...session.user,
      id: canonicalId,
      image: dbUser?.image ?? userSession.image,
      username: dbUser?.username,
      profileShareId: dbUser?.profile_share_id,
      coins: dbUser?.coins ?? 0,
      xp: dbUser?.xp ?? 0,
      level: dbUser?.level ?? 1,
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
