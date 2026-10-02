import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import {
  PASS_LADDER,
  derivePassState,
  rewardFor,
  toClaimRefs,
  toRewardPayload,
} from '$lib/server/learnerPass/schedule';

export const GET: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  const userId = session.user.id;

  const enrollment = await prisma.learner_pass_enrollment.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
  });

  if (!enrollment) {
    return Response.json({
      status: 'NOT_ENROLLED',
      hasEnrollment: false,
    });
  }

  const now = new Date();

  const claims = await prisma.learner_pass_claim.findMany({
    where: { enrollment_id: enrollment.id },
    select: {
      day_number: true,
      claimed_at: true,
    },
  });

  const state = derivePassState(enrollment, toClaimRefs(claims), now);

  const currentDayReward = rewardFor(state.currentDay);
  const upcomingRewards = PASS_LADDER.filter(
    (r) => r.day > state.currentDay && r.day <= state.currentDay + 3,
  ).slice(0, 3);

  return Response.json({
    status: state.status,
    hasEnrollment: true,
    currentDay: state.currentDay,
    totalClaimedDays: state.totalClaimedDays,
    streak: state.streak,
    claimedDays: state.claimedDays,
    canClaimNow: state.canClaimNow,
    nextAvailableAt: state.nextAvailableAt?.toISOString() ?? null,
    expiresAt: enrollment.expires_at.toISOString(),
    daysRemaining: state.daysRemaining,
    rewards: {
      current: currentDayReward ? toRewardPayload(currentDayReward) : undefined,
      upcoming: upcomingRewards.map(toRewardPayload),
    },
  });
};
