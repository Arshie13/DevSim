import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/client';
import { getProfileMetrics, getRivals } from '$lib/server/stats';
import { getTopAchievements } from '$lib/server/achievements/snapshots';

export const load: PageServerLoad = async (event) => {
  const slug = event.params.slug;
  if (!slug || !/^[a-zA-Z0-9_-]{1,32}$/.test(slug)) {
    throw error(404, 'Profile not found');
  }

  const dbUser = await prisma.user.findUnique({
    where: { profile_share_id: slug },
    select: {
      id: true,
      name: true,
      image: true,
      coins: true,
      xp: true,
      level: true,
      owned_avatars: true,
      has_completed_tutorial: true,
      username: true,
      profile_share_id: true,
    },
  });
  if (!dbUser) throw error(404, 'Profile not found');

  const [metrics, rivals, topAchievements] = await Promise.all([
    getProfileMetrics(dbUser.id),
    getRivals(dbUser.id, 6),
    getTopAchievements(dbUser.id, 3),
  ]);

  const session = await event.locals.auth();
  const isOwnProfile = session?.user?.id === dbUser.id;
  const viewerIsAuthed = Boolean(session?.user?.id);

  return {
    user: {
      id: dbUser.id,
      name: dbUser.name,
      email: '',
      image: dbUser.image,
      username: dbUser.username,
      profileShareId: dbUser.profile_share_id,
      coins: dbUser.coins ?? 0,
      xp: dbUser.xp ?? 0,
      level: dbUser.level ?? 1,
      ownedAvatars: dbUser.owned_avatars ?? [],
      hasCompletedTutorial: dbUser.has_completed_tutorial ?? false,
    },
    metrics,
    rivals,
    topAchievements,
    isOwnProfile,
    viewerIsAuthed,
  };
};
