import type { PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import prisma from '$lib/server/client';
import { computeLevel } from '$lib/utils/level';
import type { PassState } from '$lib/server/learnerPass/schedule';
import {
  PASS_LADDER,
  derivePassState,
  toClaimRefs,
  toRewardPayload,
} from '$lib/server/learnerPass/schedule';
import { rewardDayNumber } from '$lib/server/rewards/reset';
import { PASS_LENGTH, requiresCooldown, rewardFor } from '$lib/server/learnerPass/schedule';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    return {
      user: null,
      enrollment: null,
      rewards: [],
      currentAvatar: null,
    };
  }

  const userId = session.user.id;

  const [dbUser, enrollment] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
        coins: true,
        xp: true,
        owned_avatars: true,
        has_completed_tutorial: true,
      },
    }),
    prisma.learner_pass_enrollment.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    }),
  ]);

  // The User model has no level column: level is derived from xp (same mapping as /profile).
  const levelData = computeLevel(dbUser?.xp ?? 0);

  // Ladder comes from code now, emitted in the field names pass/+page.svelte already reads.
  const rewards = PASS_LADDER.map(toRewardPayload);

  let state: PassState | null = null;

  if (enrollment) {
    const claims = await prisma.learner_pass_claim.findMany({
      where: { enrollment_id: enrollment.id },
      select: {
        day_number: true,
        claimed_at: true,
      },
    });

    state = derivePassState(enrollment, toClaimRefs(claims), new Date());
  }

  return {
    user: {
      ...session.user,
      name: dbUser?.name ?? session.user.name ?? null,
      email: dbUser?.email ?? session.user.email ?? null,
      // Override session image with live DB value so avatar changes are
      // reflected immediately without requiring a re-login.
      image: dbUser?.image ?? session.user.image ?? null,
      avatar: dbUser?.image ?? session.user.avatar ?? null,
      coins: dbUser?.coins ?? 0,
      xp: dbUser?.xp ?? 0,
      level: levelData.level,
      ownedAvatars: dbUser?.owned_avatars ?? [],
      hasCompletedTutorial: dbUser?.has_completed_tutorial ?? false,
    },
    enrollment:
      enrollment && state
        ? {
            status: state.status,
            currentDay: state.currentDay,
            streak: state.streak,
            totalClaimedDays: state.totalClaimedDays,
            lastClaimedAt: state.lastClaimedAt?.toISOString() ?? null,
            expiresAt: enrollment.expires_at.toISOString(),
            claimedDayNumbers: state.claimedDays,
            // Sent rather than re-derived client-side, so the reset rule has one definition.
            canClaimNow: state.canClaimNow,
            nextAvailableAt: state.nextAvailableAt?.toISOString() ?? null,
          }
        : null,
    rewards,
    currentAvatar: dbUser?.image ?? null,
  };
};

export const actions: Actions = {
  claimReward: async (event) => {
    const session = await event.locals.auth();
    if (!session?.user?.id) return fail(401, { message: 'Unauthorized' });

    const formData = await event.request.formData();
    const dayNumber = Number(formData.get('dayNumber'));
    if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > PASS_LENGTH) {
      return fail(400, { message: 'Invalid day number' });
    }

    const userId = session.user.id;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const enrollment = await tx.learner_pass_enrollment.findFirst({
          where: { user_id: userId },
          orderBy: { created_at: 'desc' },
        });

        if (!enrollment) throw error(400, 'No active learner pass');

        const now = new Date();
        if (now > enrollment.expires_at) throw error(410, 'Pass has expired');

        const claims = await tx.learner_pass_claim.findMany({
          where: { enrollment_id: enrollment.id },
          select: { day_number: true, claimed_at: true },
        });

        const state = derivePassState(enrollment, toClaimRefs(claims), now);
        const daysSinceStart = rewardDayNumber(now) - rewardDayNumber(enrollment.created_at) + 1;

        if (dayNumber > daysSinceStart) throw error(400, 'Cannot claim rewards for future days');
        if (dayNumber > state.currentDay) throw error(400, 'Can only claim up to the current day');
        if (state.claimedDays.includes(dayNumber)) throw error(409, 'Reward already claimed for this day');
        if (requiresCooldown(dayNumber, state.currentDay) && !state.canClaimNow) {
          throw error(429, 'Rewards become available again after the next reset (16:00 UTC+8)');
        }

        const reward = rewardFor(dayNumber);
        if (!reward) throw error(500, 'Reward not configured');

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

        const updatedState = derivePassState(
          enrollment,
          [...toClaimRefs(claims), { dayNumber, claimedAt: now }],
          now,
        );

        return { updatedUser, updatedState, reward };
      });

      return {
        success: true,
        day: dayNumber,
        reward: {
          coins: result.reward.coins,
          xp: result.reward.xp,
          aiHelps: result.reward.aiHelps,
        },
        newCoins: result.updatedUser.coins,
        newXp: result.updatedUser.xp,
        newAiHelpCredits: result.updatedUser.ai_help_credits,
        streak: result.updatedState.streak,
        totalClaimedDays: result.updatedState.totalClaimedDays,
        currentDay: result.updatedState.currentDay,
        canClaimNow: result.updatedState.canClaimNow,
        nextAvailableAt: result.updatedState.nextAvailableAt?.toISOString() ?? null,
      };
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) throw err;
      console.error('Claim error:', err);
      throw error(500, 'Failed to claim reward');
    }
  },
};
