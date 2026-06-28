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

  const claimedDays = await prisma.learner_pass_day_claim.findMany({
    where: { user_id: userId },
    select: { day_number: true, claim_type: true },
  });

  return {
    enrollment: enrollment
      ? {
          status: enrollment.status,
          currentDay: enrollment.current_day,
          streak: enrollment.streak,
          totalClaimedDays: enrollment.total_claimed_days,
          lastClaimedAt: enrollment.last_claimed_at?.toISOString() ?? null,
          expiresAt: enrollment.expires_at?.toISOString(),
        }
      : null,
    rewards,
    currentAvatar: dbUser?.image ?? null,
    freeClaimedDays: claimedDays.filter(d => d.claim_type === "FREE").map((d) => d.day_number),
    premiumClaimedDays: claimedDays.filter(d => d.claim_type === "PREMIUM").map((d) => d.day_number),
  };
};
