import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import {
  PASS_LENGTH,
  derivePassState,
  requiresCooldown,
  rewardFor,
  toClaimRefs,
} from '$lib/server/learnerPass/schedule';
import { rewardDayNumber } from '$lib/server/rewards/reset';

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  const userId = session.user.id;
  const body = await event.request.json().catch(() => null);
  const dayNumber = body?.dayNumber;

  if (typeof dayNumber !== 'number' || dayNumber < 1 || dayNumber > PASS_LENGTH) {
    throw error(400, 'Invalid day number');
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const enrollment = await tx.learner_pass_enrollment.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });

      if (!enrollment) {
        throw error(400, 'No active learner pass');
      }

      const now = new Date();

      if (now > enrollment.expires_at) {
        throw error(410, 'Pass has expired');
      }

      const claims = await tx.learner_pass_claim.findMany({
        where: { enrollment_id: enrollment.id },
        select: { day_number: true, claimed_at: true },
      });

      const state = derivePassState(enrollment, toClaimRefs(claims), now);

      // Reset-days elapsed, so this agrees with `currentDay` instead of counting 24h blocks
      // from `created_at`.
      const daysSinceStart = rewardDayNumber(now) - rewardDayNumber(enrollment.created_at) + 1;

      if (dayNumber > daysSinceStart) {
        throw error(400, 'Cannot claim rewards for future days');
      }

      if (dayNumber > state.currentDay) {
        throw error(400, 'Can only claim up to the current day');
      }

      if (state.claimedDays.includes(dayNumber)) {
        throw error(409, 'Reward already claimed for this day');
      }

      // Past, missed allowance days back-fill freely — the pass is prepaid, so a day not
      // redeemed in its window is still owed. Only the current day is rate-limited. This
      // matches what pass/+page.svelte already enforced client-side.
      if (requiresCooldown(dayNumber, state.currentDay) && !state.canClaimNow) {
        throw error(429, 'Rewards become available again after the next reset (16:00 UTC+8)');
      }

      const reward = rewardFor(dayNumber);

      if (!reward) {
        throw error(500, 'Reward not configured');
      }

      await tx.learner_pass_claim.create({
        data: {
          enrollment_id: enrollment.id,
          day_number: dayNumber,
          claimed_at: now,
          coins_awarded: reward.coins,
          xp_awarded: reward.xp,
          ai_helps_awarded: reward.aiHelps,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: reward.coins },
          xp: { increment: reward.xp },
          ai_help_credits: { increment: reward.aiHelps },
        },
        select: { coins: true, xp: true, ai_help_credits: true },
      });

      // A scenario-granting reward is always a CHOICE, resolved later by choose-unlock:
      // claiming only makes the choice available. `unlockChoices` is by construction a subset
      // of `SCENARIO_3_IDS` (that set is derived from it), so there is no "grant outright"
      // path left to take and no access row to write — the claim itself becomes the grant.
      const pendingUnlocks =
        reward.unlockChoices.length > 0 ? [{ day: dayNumber, available: reward.unlockChoices }] : [];

      const updatedState = derivePassState(
        enrollment,
        [...toClaimRefs(claims), { dayNumber, claimedAt: now }],
        now,
      );

      return {
        updatedUser,
        updatedState,
        reward,
        pendingUnlocks,
      };
    });

    return Response.json({
      success: true,
      day: dayNumber,
      reward: {
        coins: result.reward.coins,
        xp: result.reward.xp,
        aiHelps: result.reward.aiHelps,
        // Always empty: a scenario-granting reward is a choice, never an immediate grant.
        // Kept in the payload so the response shape is unchanged.
        unlocks: [] as string[],
      },
      pendingUnlocks: result.pendingUnlocks,
      newCoins: result.updatedUser.coins,
      newXp: result.updatedUser.xp,
      newAiHelpCredits: result.updatedUser.ai_help_credits,
      streak: result.updatedState.streak,
      totalClaimedDays: result.updatedState.totalClaimedDays,
      currentDay: result.updatedState.currentDay,
      // Additive fields: the client no longer re-derives the cooldown from `lastClaimedAt + 24h`.
      canClaimNow: result.updatedState.canClaimNow,
      nextAvailableAt: result.updatedState.nextAvailableAt?.toISOString() ?? null,
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) throw err;
    console.error('Claim error:', err);
    throw error(500, 'Failed to claim reward');
  }
};
