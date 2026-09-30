/**
 * Daily login reward ladder — the single source of truth.
 *
 * This previously lived in three places (the GET route, the claim route, and
 * `DailyRewardsModal.svelte`), so a reward change had to be made three times or
 * the UI and the actual payout would silently disagree. It now mirrors the
 * achievements catalog: static reference data in code, referenced by every
 * consumer, with the DB storing only claim events.
 *
 * The ladder is *content*, not a closed schema domain — which is why
 * `daily_login_claim.day_index` is a plain int rather than a native enum. Compare
 * `achievement_tier`, which IS an enum because ROOKIE/AMATEUR/PRO is a domain
 * concept the schema should police. Changing `REWARD_LADDER` needs no migration.
 */

import {
  nextResetAt,
  rewardDayFromStoredDate,
  rewardDayNumber,
} from '$lib/server/rewards/reset';

export interface DailyReward {
  /** 1-based label, for display only. `day - 1` is the stored `day_index`. */
  day: number;
  coins: number;
  xp: number;
  aiHelps: number;
}

export const REWARD_LADDER: readonly DailyReward[] = [
  { day: 1, coins: 50, xp: 10, aiHelps: 1 },
  { day: 2, coins: 75, xp: 20, aiHelps: 1 },
  { day: 3, coins: 100, xp: 30, aiHelps: 2 },
  { day: 4, coins: 150, xp: 40, aiHelps: 2 },
  { day: 5, coins: 200, xp: 50, aiHelps: 2 },
  { day: 6, coins: 300, xp: 75, aiHelps: 3 },
  { day: 7, coins: 500, xp: 100, aiHelps: 5 },
];

/** Number of days in one run through the ladder. */
export const CYCLE_LENGTH = REWARD_LADDER.length;

// The reward-day boundary is shared with the Learner Pass. One definition lives in
// `rewards/reset.ts`; re-exported here so existing importers of this module are unaffected.
export {
  MS_PER_DAY,
  RESET_HOUR_UTC,
  nextResetAt,
  rewardDayDate,
  rewardDayFromStoredDate,
  rewardDayNumber,
} from '$lib/server/rewards/reset';

/** Reward for a 0-based day index, or `undefined` if out of range. */
export function rewardFor(dayIndex: number): DailyReward | undefined {
  return REWARD_LADDER[dayIndex];
}

/** Minimal shape of a stored claim, so this stays a pure module (no Prisma import). */
export interface ClaimRef {
  cycleIndex: number;
  dayIndex: number;
  /** Reset-shifted reward-day number. */
  rewardDay: number;
  /** Exact instant of the claim. Informational only — the derivations ignore it. */
  claimedAt: Date;
}

/**
 * Map Prisma claim rows (snake_case columns) to `ClaimRef`. Structural typing, so
 * this stays a pure module with no Prisma import.
 */
export function toClaimRefs(
  rows: {
    cycle_index: number;
    day_index: number;
    claimed_on: Date;
    claimed_at: Date;
  }[],
): ClaimRef[] {
  return rows.map((r) => ({
    cycleIndex: r.cycle_index,
    dayIndex: r.day_index,
    rewardDay: rewardDayFromStoredDate(r.claimed_on),
    claimedAt: r.claimed_at,
  }));
}

/**
 * Streak = the run of consecutive reward days ending at the most recent claim.
 * No threshold, no elapsed-time arithmetic: a missed reward day is simply an absent
 * date, so it breaks the run by construction.
 *
 * The streak deliberately spans cycles — the `login_streak` achievement asks for
 * 20 days, which no single 7-day cycle could reach.
 *
 * Note this mirrors the previous behaviour of *not* expiring a stale streak: an
 * inactive user keeps their last run until they next claim.
 */
export function deriveStreak(claims: ClaimRef[]): number {
  if (claims.length === 0) return 0;

  // Unique + descending, so consecutive days differ by exactly 1.
  const days = [...new Set(claims.map((c) => c.rewardDay))].sort((a, b) => b - a);

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i - 1] - days[i] !== 1) break;
    streak++;
  }
  return streak;
}

export interface CycleState {
  /** Cycle the next claim belongs to. */
  cycleIndex: number;
  /** 0-based day index the next claim will grant. */
  dayIndex: number;
  /** 1-based display day, for the UI. */
  dayNumber: number;
  /** Day indexes already claimed in `cycleIndex`. Empty once the cycle completes. */
  claimedDays: number[];
  /** True when the current cycle's ladder is fully claimed. */
  cycleComplete: boolean;
  /** False once today's reward has been claimed (fixed daily reset). */
  canClaim: boolean;
  /** Milliseconds until the next reset; 0 when a claim is available. */
  msUntilReset: number;
  /** The instant the next reward becomes available. */
  nextResetAt: Date;
  /** Reset-shifted reward-day number of "now". */
  today: number;
  /** Derived from the claim history, spanning cycles. See `deriveStreak`. */
  streak: number;
  /** `MAX(claimed_at)`, or `null` if never claimed. Informational only. */
  lastClaimedAt: Date | null;
}

/**
 * Pure derivation of everything a caller needs, shared by the GET route, the claim
 * route, and (via the API payload) the modal. Previously each caller reimplemented
 * `highestClaimed + 2`, the streak, and the availability rule independently.
 *
 * Everything comes from the claim history, so an empty list is a valid input for a
 * user who has never claimed — no caller needs a special branch.
 */
export function deriveCycleState(claims: ClaimRef[], now: Date): CycleState {
  const currentCycle = claims.reduce((max, c) => Math.max(max, c.cycleIndex), 0);
  const claimedDays = claims
    .filter((c) => c.cycleIndex === currentCycle)
    .map((c) => c.dayIndex);
  const highest = claimedDays.reduce((max, d) => Math.max(max, d), -1);

  // Advance to a fresh cycle once the ladder is exhausted, so it can repeat
  // instead of dead-ending (the old key made day 8 unreachable).
  const cycleComplete = highest >= CYCLE_LENGTH - 1;
  const cycleIndex = cycleComplete ? currentCycle + 1 : currentCycle;
  const dayIndex = cycleComplete ? 0 : highest + 1;

  const lastClaimedAt = claims.reduce<Date | null>(
    (max, c) => (max === null || c.claimedAt > max ? c.claimedAt : max),
    null,
  );

  // No elapsed-time arithmetic: a claim is available exactly when today's reward
  // day has no claim against it.
  const today = rewardDayNumber(now);
  const nextReset = nextResetAt(now);
  const canClaim = !claims.some((c) => c.rewardDay === today);
  const msUntilReset = canClaim ? 0 : nextReset.getTime() - now.getTime();

  return {
    cycleIndex,
    dayIndex,
    dayNumber: dayIndex + 1,
    claimedDays: cycleComplete ? [] : claimedDays,
    cycleComplete,
    canClaim,
    msUntilReset,
    nextResetAt: nextReset,
    today,
    streak: deriveStreak(claims),
    lastClaimedAt,
  };
}
