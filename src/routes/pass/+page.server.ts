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

  const enrollment = await prisma.learner_pass_enrollment.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  const rewards = await prisma.learner_pass_reward.findMany({
    where: { is_active: true },
    orderBy: { day_number: "asc" },
  });

  const claimedDays = enrollment
    ? await prisma.learner_pass_day_claim.findMany({
        where: { enrollment_id: enrollment.id },
        select: { day_number: true },
      })
    : [];

  return {
    enrollment: enrollment
      ? {
          status: enrollment.status,
          currentDay: enrollment.current_day,
          streak: enrollment.streak,
          totalClaimedDays: enrollment.total_claimed_days,
          expiresAt: enrollment.expires_at?.toISOString(),
        }
      : null,
    rewards,
    claimedDays: claimedDays.map((d) => d.day_number),
  };
};