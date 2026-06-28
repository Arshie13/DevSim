import type { PageServerLoad } from "./$types";
import prisma from "$lib/server/client";

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
  };
};
