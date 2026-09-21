import type { PageServerLoad } from "./$types";
import prisma from "$lib/server/client";
import { SPECIAL_UNLOCK_DAYS, getSpecialUnlocksForDay } from "$lib/utils/reward-constants";
import { getCurrentStreak } from "$lib/utils/learnerPassStreak";
import { computeLevel } from "$lib/utils/level";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    return {
      user: null,
      enrollment: null,
      rewards: [],
    };
  }

  const userId = session.user.id;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      coins: true,
      xp: true,
      owned_avatars: true,
      has_completed_tutorial: true,
    },
  });

  // The User model has no level/avatar columns: level is derived from xp and
  // the equipped avatar is the stored image (same mapping as /profile).
  const levelData = computeLevel(dbUser?.xp ?? 0);

  const enrollment = await prisma.learner_pass_enrollment.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  const rewards = await prisma.learner_pass_reward.findMany({
    orderBy: { reward_index: "asc" },
  });

  const start = enrollment?.created_at ?? new Date();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const currentDay = Math.min(30, Math.floor((Date.now() - start.getTime()) / ONE_DAY_MS) + 1);

  let pendingUnlocks: { day: number; available: string[] }[] = [];
  if (enrollment) {
    const unlockedProjects = await prisma.user_project_access.findMany({
      where: { user_id: userId, source: 'LEARNER_PASS' },
      select: { scenario_id: true },
    });
    const unlockedIds = new Set(unlockedProjects.map((p) => p.scenario_id));
    const choices = (enrollment.unlock_choices as string[]) || [];
    for (const day of enrollment.claimed_day_numbers) {
      if (!SPECIAL_UNLOCK_DAYS.includes(day)) continue;
      const dayScenario = getSpecialUnlocksForDay(day)[0];
      if (!dayScenario || choices.includes(dayScenario)) continue;
      const available = getSpecialUnlocksForDay(day).filter((id) => !unlockedIds.has(id));
      if (available.length > 0) {
        pendingUnlocks.push({ day, available });
      }
    }
  }

  const claimedDayNumbers: number[] = enrollment?.claimed_day_numbers ?? [];
  const uniqueClaimedDays = new Set(claimedDayNumbers);

  const now = new Date();
  const isExpired = !!(enrollment?.expires_at && now > enrollment.expires_at);
  const isCompleted = uniqueClaimedDays.size >= 30;
  const isActive = !!enrollment?.created_at && !isExpired && !isCompleted;

  const status = isCompleted
    ? "COMPLETED"
    : isExpired
      ? "EXPIRED"
      : isActive
        ? "ACTIVE"
        : enrollment
          ? "ACTIVE"
          : "INACTIVE";

  const streak = enrollment
    ? getCurrentStreak(enrollment.streak, enrollment.last_claimed_at, now)
    : 0;

  return {
    user: {
      ...session.user,
      name: dbUser?.name ?? session.user.name ?? null,
      email: dbUser?.email ?? session.user.email ?? null,
      // Override session image with live DB value so avatar changes are
      // reflected immediately without requiring a re-login.
      image: dbUser?.image ?? session.user.image ?? null,
      avatar: dbUser?.image ?? session.user.avatar ?? null,
      coins: dbUser?.coins ?? 0,
      xp: dbUser?.xp ?? 0,
      level: levelData.level,
      ownedAvatars: dbUser?.owned_avatars ?? [],
      hasCompletedTutorial: dbUser?.has_completed_tutorial ?? false,
    },
    enrollment: enrollment
      ? {
          status,
          currentDay,
          streak,
          totalClaimedDays: uniqueClaimedDays.size,
          lastClaimedAt: enrollment.last_claimed_at?.toISOString() ?? null,
          expiresAt: enrollment.expires_at?.toISOString(),
          claimedDayNumbers: [...uniqueClaimedDays],
        }
      : null,
    rewards,
    currentAvatar: dbUser?.image ?? null,
    pendingUnlocks,
  };
};
