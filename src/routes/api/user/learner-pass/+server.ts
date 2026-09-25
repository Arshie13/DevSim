import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";
import { SPECIAL_UNLOCK_DAYS, getSpecialUnlocksForDay } from "$lib/utils/reward-constants";
import { getCurrentStreak } from "$lib/utils/learnerPassStreak";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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
  const isExpired = !!enrollment.expires_at && now > enrollment.expires_at;

  // Use a Set to deduplicate before comparing to 30 to avoid false positives
  // from any legacy duplicate entries in the array.
  const uniqueClaimedDays = new Set(enrollment.claimed_day_numbers);
  const isCompleted = uniqueClaimedDays.size >= 30;
  const isActive = !isExpired && !isCompleted;

  // Derive status — an enrollment always has created_at so it's always started.
  const status = isCompleted
    ? "COMPLETED"
    : isExpired
      ? "EXPIRED"
      : isActive
        ? "ACTIVE"
        : "INACTIVE";

  const start = enrollment.created_at;
  const currentDay = Math.min(
    30,
    Math.floor((now.getTime() - start.getTime()) / ONE_DAY_MS) + 1,
  );

  // Use 24h millisecond comparison — avoids timezone issues with toDateString().
  const canClaimNow =
    isActive &&
    (enrollment.last_claimed_at === null ||
      now.getTime() - new Date(enrollment.last_claimed_at).getTime() >= ONE_DAY_MS);

  const daysRemaining = enrollment.expires_at
    ? Math.max(
        0,
        Math.ceil(
          (enrollment.expires_at.getTime() - now.getTime()) / ONE_DAY_MS,
        ),
      )
    : 0;

  const nextAvailableAt =
    !canClaimNow && enrollment.last_claimed_at
      ? new Date(
          new Date(enrollment.last_claimed_at).getTime() + ONE_DAY_MS,
        ).toISOString()
      : null;

  const rewards = await prisma.learner_pass_reward.findMany({
    orderBy: { reward_index: "asc" },
  });

  const currentDayReward = rewards.find((r) => r.reward_index === currentDay);
  const upcomingRewards = rewards
    .filter(
      (r) => r.reward_index > currentDay && r.reward_index <= currentDay + 3,
    )
    .slice(0, 3);

  const unlockedProjects = await prisma.user_project_access.findMany({
    where: { user_id: userId, source: "LEARNER_PASS" },
    select: { scenario_id: true, granted_at: true },
  });

  // Validate unlock_choices defensively — it's a JSON column, shape not guaranteed.
  const choices: string[] = Array.isArray(enrollment.unlock_choices)
    ? (enrollment.unlock_choices as unknown[]).filter(
        (c): c is string => typeof c === "string",
      )
    : [];

  const pendingUnlocks = [];
  for (const day of uniqueClaimedDays) {
    if (!SPECIAL_UNLOCK_DAYS.includes(day)) continue;
    const available = getSpecialUnlocksForDay(day).filter(
      (id) =>
        !choices.includes(id) &&
        !unlockedProjects.some((p) => p.scenario_id === id),
    );
    if (available.length > 0) {
      pendingUnlocks.push({ day, available });
    }
  }

  const streak = getCurrentStreak(enrollment.streak, enrollment.last_claimed_at, now);

  return Response.json({
    status,
    hasEnrollment: true,
    currentDay,
    totalClaimedDays: uniqueClaimedDays.size,
    streak,
    claimedDays: [...uniqueClaimedDays],
    canClaimNow,
    nextAvailableAt,
    expiresAt: enrollment.expires_at?.toISOString(),
    daysRemaining,
    rewards: {
      current: currentDayReward,
      upcoming: upcomingRewards,
    },
    unlockedProjects: unlockedProjects.map((p) => ({
      projectId: p.scenario_id,
      grantedAt: p.granted_at.toISOString(),
    })),
    pendingUnlocks,
  });
};
