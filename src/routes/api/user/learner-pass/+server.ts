import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";

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

  const claimedDays = await prisma.learner_pass_day_claim.findMany({
    where: { enrollment_id: enrollment.id },
    select: { day_number: true, claimed_at: true },
  });

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
    (r) => r.day_number === enrollment.current_day,
  );
  const upcomingRewards = rewards
    .filter((r) => r.day_number > enrollment.current_day && r.day_number <= enrollment.current_day + 3)
    .slice(0, 3);

  const unlockedProjects = await prisma.user_project_access.findMany({
    where: { user_id: userId, source: "LEARNER_PASS" },
    select: { project_id: true, granted_at: true },
  });

  return Response.json({
    status: enrollment.status,
    hasEnrollment: true,
    currentDay: enrollment.current_day,
    totalClaimedDays: enrollment.total_claimed_days,
    streak: enrollment.streak,
    claimedDays: claimedDays.map((d) => d.day_number),
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
  });
};