import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import prisma from '$lib/server/client';
import { getProfileMetrics, getRivals, getRecentActivity } from '$lib/server/stats';
import { getTopAchievements } from '$lib/server/achievements/snapshots';
import { computeLevel } from '$lib/utils/level';
import { PREMIUM_AVATARS } from '$lib/utils/avatar';

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

  const [metrics, rivals, topAchievements, activity] = await Promise.all([
    getProfileMetrics(userSession.id),
    getRivals(userSession.id, dbUser?.xp ?? 0, 4),
    getTopAchievements(userSession.id, 3),
    getRecentActivity(userSession.id, 4),
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
    activity,
  };
};

export const actions: Actions = {
  updateUsername: async ({ locals, request }) => {
    const session = await locals.auth();
    if (!session?.user?.id) return fail(401, { error: 'Unauthorized' });

    const formData = await request.formData();
    const raw = formData.get('username');
    const username = typeof raw === 'string' ? raw.trim().toLowerCase() : '';

    if (!/^[a-z0-9_-]{3,16}$/.test(username)) {
      return fail(400, { error: 'Username must be 3-16 characters long and contain only letters, numbers, hyphens, or underscores' });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { username }, select: { id: true } });
      if (existingUser && existingUser.id !== session.user.id) {
        return fail(409, { error: 'Username already taken' });
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: { username },
      });

      return { success: true, username };
    } catch (err) {
      if ((err as { code?: string })?.code === 'P2002') {
        return fail(409, { error: 'Username already taken' });
      }
      console.error('Error updating username:', err);
      return fail(500, { error: 'Failed to update username' });
    }
  },

  purchaseAvatar: async ({ locals, request }) => {
    const session = await locals.auth();
    if (!session?.user?.id) return fail(401, { error: 'Unauthorized' });

    const formData = await request.formData();
    const avatarPath = formData.get('avatarPath');
    if (typeof avatarPath !== 'string' || !avatarPath) {
      return fail(400, { error: 'avatarPath is required' });
    }

    const premiumAvatar = PREMIUM_AVATARS.find((avatar) => avatar.path === avatarPath);
    if (!premiumAvatar) return fail(400, { error: 'Unknown or non-premium avatar path' });

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coins: true, owned_avatars: true },
    });
    if (!dbUser) return fail(404, { error: 'User not found' });
    if (dbUser.owned_avatars.includes(avatarPath)) return fail(409, { error: 'Avatar already owned' });
    if (dbUser.coins < premiumAvatar.price) return fail(402, { error: 'Insufficient coins' });

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        coins: { decrement: premiumAvatar.price },
        owned_avatars: { push: avatarPath },
      },
      select: { coins: true, owned_avatars: true },
    });

    return {
      success: true,
      newCoins: updated.coins,
      ownedAvatars: updated.owned_avatars,
    };
  },
};
