import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import {
  PASS_LADDER,
  derivePassState,
  derivePendingUnlocks,
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
      unlocked_scenario: true,
      unlocked_at: true,
      fallback_reward: true,
    },
  });

  const state = derivePassState(enrollment, toClaimRefs(claims), now);

  const currentDayReward = rewardFor(state.currentDay);
  const upcomingRewards = PASS_LADDER.filter(
    (r) => r.day > state.currentDay && r.day <= state.currentDay + 3,
  ).slice(0, 3);

  // Unlocks come straight from the claims — the claim IS the grant now that
  // `user_project_access` is gone. `unlocked_at` is when the choice was made, which can be
  // well after `claimed_at`: a day is claimed, then its reward is spent later.
  const unlockedProjects = claims
    .filter((c) => typeof c.unlocked_scenario === 'string')
    .map((c) => ({
      scenarioId: c.unlocked_scenario as string,
      grantedAt: c.unlocked_at ?? c.claimed_at,
    }));

  // A special day stops being "pending" once a choice is recorded for it. Scoping that check
  // per day is the fix: the old flat `unlock_choices` array was checked globally, so a single
  // choice silently suppressed the prompt for every other special day. Both outcomes count,
  // since a fallback leaves `unlocked_scenario` null.
  const resolvedDays = new Set(
    claims
      .filter(
        (c) => typeof c.unlocked_scenario === 'string' || typeof c.fallback_reward === 'string',
      )
      .map((c) => c.day_number),
  );

  // Ownership spans every pass, so it is queried user-scoped — the claims above are this pass
  // only, which is all the state derivation needs.
  const ownedRows = await prisma.learner_pass_claim.findMany({
    where: { enrollment: { user_id: userId }, unlocked_scenario: { not: null } },
    select: { unlocked_scenario: true },
  });
  const ownedScenarios = new Set(ownedRows.map((r) => r.unlocked_scenario as string));

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
    unlockedProjects: unlockedProjects.map((p) => ({
      projectId: p.scenarioId,
      grantedAt: p.grantedAt.toISOString(),
    })),
    pendingUnlocks: derivePendingUnlocks(state.claimedDays, ownedScenarios, resolvedDays),
  });
};
