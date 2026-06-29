import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";
import { SPECIAL_UNLOCK_DAYS, getSpecialUnlocksForDay } from "$lib/utils/reward-constants";

export const GET: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    throw error(401, "Unauthorized");
  }

  const userId = session.user.id;

  const enrollment = await prisma.learner_pass_enrollment.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  if (!enrollment) {
    return Response.json({
      status: "NOT_ENROLLED",
      hasEnrollment: false,
    });
  }

  const now = new Date();
  const isExpired = enrollment.expires_at && now > enrollment.expires_at;

  if (isExpired && enrollment.status === "ACTIVE") {
    await prisma.learner_pass_enrollment.update({
      where: { id: enrollment.id },
      data: { status: "EXPIRED" },
    });
    enrollment.status = "EXPIRED";
  }

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const start = enrollment.started_at ?? now;
  const currentDay = Math.min(30, Math.floor((now.getTime() - start.getTime()) / ONE_DAY_MS) + 1);

  const canClaimNow =
    enrollment.status === "ACTIVE" &&
    !isExpired &&
    (enrollment.last_claimed_at === null ||
      new Date().toDateString() !==
        new Date(enrollment.last_claimed_at).toDateString());

  const daysRemaining = enrollment.expires_at
    ? Math.max(
        0,
        Math.ceil(
          (enrollment.expires_at.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  const nextAvailableAt =
    enrollment.last_claimed_at && canClaimNow === false
      ? new Date(
          new Date(enrollment.last_claimed_at).getTime() +
            24 * 60 * 60 * 1000,
        ).toISOString()
      : null;

  const rewards = await prisma.learner_pass_reward.findMany({
    where: { is_active: true },
    orderBy: { day_number: "asc" },
  });

  const currentDayReward = rewards.find(
    (r) => r.day_number === currentDay,
  );
  const upcomingRewards = rewards
    .filter((r) => r.day_number > currentDay && r.day_number <= currentDay + 3)
    .slice(0, 3);

  const unlockedProjects = await prisma.user_project_access.findMany({
    where: { user_id: userId, source: "LEARNER_PASS" },
    select: { project_id: true, granted_at: true },
  });

  const choices = (enrollment.unlock_choices as any[]) || [];
  const pendingUnlocks = [];
  for (const day of enrollment.claimed_days) {
    if (!SPECIAL_UNLOCK_DAYS.includes(day)) continue;
    if (choices.some((c: any) => c.dayNumber === day)) continue;
    const available = getSpecialUnlocksForDay(day).filter(
      (id) => !unlockedProjects.some((p) => p.project_id === id),
    );
    if (available.length > 0) {
      pendingUnlocks.push({ day, available });
    }
  }

  return Response.json({
    status: enrollment.status,
    hasEnrollment: true,
    currentDay,
    totalClaimedDays: enrollment.total_claimed_days,
    streak: enrollment.streak,
    claimedDays: enrollment.claimed_days,
    canClaimNow,
    nextAvailableAt,
    expiresAt: enrollment.expires_at?.toISOString(),
    daysRemaining,
    rewards: {
      current: currentDayReward,
      upcoming: upcomingRewards,
    },
    unlockedProjects: unlockedProjects.map((p) => ({
      projectId: p.project_id,
      grantedAt: p.granted_at.toISOString(),
    })),
    pendingUnlocks,
  });
};