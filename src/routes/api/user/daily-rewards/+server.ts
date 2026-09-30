import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { REWARD_LADDER } from '$lib/server/dailyRewards/schedule';
import { getDailyLoginState } from '$lib/server/dailyRewards/queries';

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_MINUTE = 60 * 1000;

export const GET: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  try {
    const now = new Date();

    // Everything comes from the claim history — there is no parent row to load,
    // and a user who has never claimed derives to cycle 0 / day 0 with no special
    // branch.
    const state = await getDailyLoginState(session.user.id, now);

    const hours = Math.floor(state.msUntilReset / MS_PER_HOUR);
    const minutes = Math.floor((state.msUntilReset % MS_PER_HOUR) / MS_PER_MINUTE);

    return Response.json({
      cycleIndex: state.cycleIndex,
      cycleLength: REWARD_LADDER.length,
      // 1-based display day within the current cycle.
      currentDay: state.dayNumber,
      // Day indexes claimed in the CURRENT cycle — resets when a cycle completes.
      claimedDays: state.claimedDays,
      streak: state.streak,
      lastClaimedAt: state.lastClaimedAt,
      canClaimToday: state.canClaim,
      // Reset-based: the next 08:00 UTC (16:00 UTC+8), not 24h after the claim.
      nextAvailableAt: state.canClaim ? null : state.nextResetAt.toISOString(),
      cooldown: { remainingMs: state.msUntilReset, hours, minutes },
      rewards: REWARD_LADDER,
    });
  } catch (err) {
    console.error('Error fetching daily rewards:', err);
    throw error(500, 'Failed to fetch daily rewards');
  }
};
