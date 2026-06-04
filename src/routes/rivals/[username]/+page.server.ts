import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/client';
import { getProfileMetrics, getRivals } from '$lib/server/stats';
import { getTopAchievements } from '$lib/server/achievements/snapshots';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    throw redirect(303, '/login');
  }

  const { username } = event.params;

  // Find the target user by username
  const targetUser = await prisma.user.findUnique({
    where: { username },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      image: true, 
      xp: true, 
      level: true, 
      owned_avatars: true, 
      has_completed_tutorial: true, 
      username: true,
      createdAt: true
    },
  });

  if (!targetUser) {
    throw error(404, 'User not found');
  }

  // Fetch metrics, rivals, and top achievements for the target user
  const [metrics, rivals, topAchievements, currentUserDb] = await Promise.all([
    getProfileMetrics(targetUser.id),
    getRivals(targetUser.id, 6),
    getTopAchievements(targetUser.id, 3),
    prisma.user.findUnique({
      where: { id: currentUserId },
      select: { coins: true, image: true, owned_avatars: true }
    })
  ]);

  return {
    targetUser: {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      image: targetUser.image,
      avatar: targetUser.owned_avatars[0] || targetUser.image || "",
      xp: targetUser.xp,
      level: targetUser.level,
      ownedAvatars: targetUser.owned_avatars,
      hasCompletedTutorial: targetUser.has_completed_tutorial,
      username: targetUser.username,
    },
    metrics,
    rivals,
    topAchievements,
    isOwnProfile: currentUserId === targetUser.id,
    // Header data for the current user
    user: {
      ...session.user,
      avatar: currentUserDb?.owned_avatars[0] || currentUserDb?.image || session.user.image,
    },
    userCoins: currentUserDb?.coins ?? 0
  };
};
