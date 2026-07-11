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

  let enrollment = await prisma.learner_pass_enrollment.findFirst({
    where: { user_id: userId, status: 'ACTIVE' },
    orderBy: { created_at: "desc" },
  });
  // ponytail: fall back to most recent if no ACTIVE enrollment
  if (!enrollment) {
    enrollment = await prisma.learner_pass_enrollment.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });
  }

  const rewards = await prisma.learner_pass_reward.findMany({
    where: { is_active: true },
    orderBy: { day_number: "asc" },
  });

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const start = enrollment?.started_at ?? new Date();
  const currentDay = Math.min(30, Math.floor((Date.now() - start.getTime()) / ONE_DAY_MS) + 1);

  let pendingUnlocks: { day: number; available: string[] }[] = [];
  if (enrollment) {
    const unlockedProjects = await prisma.user_project_access.findMany({
      where: { user_id: userId, source: 'LEARNER_PASS' },
      select: { project_id: true },
    });
    const unlockedIds = new Set(unlockedProjects.map((p) => p.project_id));
    const choices = (enrollment.unlock_choices as any[]) || [];
    for (const day of enrollment.claimed_days) {
      if (!SPECIAL_UNLOCK_DAYS.includes(day)) continue;
      if (choices.some((c: any) => c.dayNumber === day)) continue;
      const available = getSpecialUnlocksForDay(day).filter((id) => !unlockedIds.has(id));
      if (available.length > 0) {
        pendingUnlocks.push({ day, available });
      }
    }
  }

  return {
    enrollment: enrollment
      ? {
          status: enrollment.status,
          currentDay,
          streak: enrollment.streak,
          totalClaimedDays: enrollment.total_claimed_days,
          lastClaimedAt: enrollment.last_claimed_at?.toISOString() ?? null,
          expiresAt: enrollment.expires_at?.toISOString(),
          claimedDays: enrollment.claimed_days,
        }
      : null,
    rewards,
    currentAvatar: dbUser?.image ?? null,
    pendingUnlocks,
  };
};
