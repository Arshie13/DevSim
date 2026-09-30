import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import { detectNewlyUnlockedAchievements } from '$lib/server/achievements/unlocks';
import {
  CYCLE_LENGTH,
  deriveCycleState,
  rewardDayDate,
  rewardFor,
  toClaimRefs,
} from '$lib/server/dailyRewards/schedule';
import { getDailyLoginState } from '$lib/server/dailyRewards/queries';

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_MINUTE = 60 * 1000;

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  const userId = session.user.id;

  const body = await event.request.json().catch(() => null);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();

      // No parent row to create — the claim rows ARE the state. An empty history
      // is a valid input, so the first-ever claim takes the same path as any
      // other, and there is nothing to keep in sync.
      const claims = await tx.daily_login_claim.findMany({
        where: { user_id: userId },
        select: {
          cycle_index: true,
          day_index: true,
          claimed_on: true,
          claimed_at: true,
        },
      });

      const state = deriveCycleState(toClaimRefs(claims), now);

      // A stale client may offer the wrong rung; a forged one may offer any rung.
      // The old fresh-account branch trusted `dayIndex` outright, so POSTing
      // { dayIndex: 6 } on a new account granted day 7 (500 coins) immediately.
      if (body?.dayIndex !== undefined && body.dayIndex !== state.dayIndex) {
        throw error(409, `Day ${state.dayNumber} is next — refresh and try again`);
      }

      // Availability is the fixed daily reset, not elapsed time: a claim is
      // allowed exactly when today's reward day has no claim against it.
      if (!state.canClaim) {
        const hours = Math.floor(state.msUntilReset / MS_PER_HOUR);
        const minutes = Math.floor((state.msUntilReset % MS_PER_HOUR) / MS_PER_MINUTE);
        throw error(
          429,
          `Already claimed today — next reward in ${hours}h ${minutes}m (resets 16:00 UTC+8)`,
        );
      }

      const reward = rewardFor(state.dayIndex);
      if (!reward) throw error(500, 'Invalid reward schedule');

      // No read-then-write pre-check: the primary key
      // (daily_login_id, cycle_index, day_index) absorbs a concurrent duplicate
      // at the DB level, so a race surfaces as P2002 rather than a double payout.
      await tx.daily_login_claim.create({
        data: {
          user_id: userId,
          claimed_on: rewardDayDate(state.today),
          cycle_index: state.cycleIndex,
          day_index: state.dayIndex,
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

      return { state, updatedUser, reward };
    });

    const newlyUnlocked = await detectNewlyUnlockedAchievements(userId);

    // Where the user stands *after* this claim — so a completed ladder reports
    // the fresh cycle (day 1, nothing claimed) instead of dead-ending at day 8.
    // Re-read after commit so the response matches exactly what was stored.
    const after = await getDailyLoginState(userId);

    return Response.json({
      success: true,
      // What was just granted.
      day: result.state.dayNumber,
      cycleIndex: result.state.cycleIndex,
      cycleCompleted: result.state.dayIndex === CYCLE_LENGTH - 1,
      coins: result.reward.coins,
      xp: result.reward.xp,
      aiHelps: result.reward.aiHelps,
      newCoins: result.updatedUser.coins,
      newXp: result.updatedUser.xp,
      newAiHelpCredits: result.updatedUser.ai_help_credits,
      streak: after.streak,
      // Where the user stands next.
      currentDay: after.dayNumber,
      claimedDays: after.claimedDays,
      canClaimToday: after.canClaim,
      nextAvailableAt: after.nextResetAt.toISOString(),
      cooldown: {
        remainingMs: after.msUntilReset,
        hours: Math.floor(after.msUntilReset / MS_PER_HOUR),
        minutes: Math.floor((after.msUntilReset % MS_PER_HOUR) / MS_PER_MINUTE),
      },
      newlyUnlocked,
    });
  } catch (err) {
    // Re-throw SvelteKit errors (400/409/429/500) as-is.
    if (typeof err === 'object' && err !== null && 'status' in err) throw err;

    // A concurrent claim won the race and the unique key rejected ours.
    if (typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2002') {
      throw error(409, 'Reward already claimed');
    }

    console.error('Error claiming daily reward:', err);
    throw error(500, 'Failed to claim reward');
  }
};
