import type { PageServerLoad } from "./$types";
import prisma from "$lib/server/client";
import { SPECIAL_UNLOCK_DAYS, getSpecialUnlocksForDay } from "$lib/utils/reward-constants";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    return {
      enrollment: null,
      rewards: [],
    };
  }

  const userId = session.user.id;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { image: true },
  });

  const enrollment = await prisma.learner_pass_enrollment.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  const rewards = await prisma.learner_pass_reward.findMany({
    orderBy: { reward_index: "asc" },
  });

  const start = enrollment?.started_at ?? new Date();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const currentDay = Math.min(30, Math.floor((Date.now() - start.getTime()) / ONE_DAY_MS) + 1);

  let pendingUnlocks: { day: number; available: string[] }[] = [];
  if (enrollment) {
    const unlockedProjects = await prisma.user_project_access.findMany({
      where: { user_id: userId, source: 'LEARNER_PASS' },
      select: { project_id: true },
    });
    const unlockedIds = new Set(unlockedProjects.map((p) => p.project_id));
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

  const now = new Date();
  const isExpired = enrollment?.expires_at && now > enrollment.expires_at;
  const isCompleted = (enrollment?.claimed_day_numbers.length ?? 0) >= 30;
  const isActive = !!enrollment?.started_at && !isExpired && !isCompleted;

  return {
    enrollment: enrollment
      ? {
          status: isCompleted ? "COMPLETED" : isExpired ? "EXPIRED" : isActive ? "ACTIVE" : "ACTIVE",
          currentDay,
          streak: enrollment.streak,
          totalClaimedDays: enrollment.claimed_day_numbers.length,
          lastClaimedAt: enrollment.last_claimed_at?.toISOString() ?? null,
          expiresAt: enrollment.expires_at?.toISOString(),
          claimedDayNumbers,
        }
      : null,
    rewards,
    currentAvatar: dbUser?.image ?? null,
    pendingUnlocks,
  };
};
