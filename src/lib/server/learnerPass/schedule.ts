/**
 * Learner Pass reward ladder and progress derivation — the single source of truth.
 *
 * The pass is a **prepaid 30-day allowance**, not a calendar feature: `day` is a slot
 * in the allowance, and days accrue whether or not the user claims them. That is why
 * progress is keyed on `day_number` rather than a date, and why a user can back-fill days
 * they missed — only the *current* day waits for the reset (see `requiresCooldown`).
 *
 * "Day" means the same thing here as in daily login: a reset-shifted reward day on the
 * shared boundary in `rewards/reset.ts` (16:00 UTC+8 == 08:00 UTC), not a rolling 24h
 * window. The two features used to disagree about that, so claims one hour apart could
 * count as adjacent in one place and not the other.
 *
 * Rationale for living in code rather than the `learner_pass_rewards` table it
 * replaced: this is static reference data, so the table bought only an admin editor
 * while costing a join, per-environment drift, and a three-way duplication of the
 * special-day → scenario mapping (here, in `learner_pass_reward.unlocked_scenario`, and
 * in the `app_settings.learner_pass_day_to_scenario` key that nothing ever read).
 * Same call as the achievements catalog and the daily-login ladder.
 */

import { MS_PER_DAY, nextResetAt, rewardDayNumber } from '$lib/server/rewards/reset';

export type PassStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'INACTIVE' | 'NOT_ENROLLED';

export interface PassReward {
  /** 1-based allowance slot, 1..PASS_LENGTH. */
  day: number;
  coins: number;
  xp: number;
  aiHelps: number;
  /** Scenario ids this slot offers to unlock. Empty for ordinary days. */
  unlockChoices: string[];
  /**
   * Consolation when every scenario this slot offers is already owned — the user picks one.
   * Milestone days hand out a single SCENARIO_3 project each and unlocks outlive the pass, so
   * without this a repeat buyer's milestone day pays nothing. Absent on ordinary days.
   *
   * Kept hand-tuned rather than derived from `unlockChoices`: a scenario's price is not what a
   * player paid for the pass, so there is no exchange rate to infer it from. The values sit at
   * or above the neighbouring coin/AI-help days (≈25 coins per AI help, the rate the ladder
   * itself implies, e.g. day 27 = 900 coins vs day 28 = 35 AI helps) so a milestone day never
   * feels cheaper than an ordinary one, and escalate with position in the pass.
   */
  fallback?: { coins: number; aiHelps: number };
  /**
   * Display metadata, consumed verbatim by `pass/+page.svelte`'s `getRewardIcon()`,
   * which switches on `displayType` ("coins" | "help" | "avatar" | "badge" | …).
   * Keep these strings in sync with that component.
   */
  displayType: string;
  displayValue: string;
}

export const PASS_LADDER: readonly PassReward[] = [
  { day: 1, coins: 100, xp: 0, aiHelps: 0, unlockChoices: [], displayType: 'coins', displayValue: '100 Coins' },
  { day: 2, coins: 0, xp: 0, aiHelps: 3, unlockChoices: [], displayType: 'help', displayValue: '+3 AI Helps' },
  { day: 3, coins: 150, xp: 0, aiHelps: 0, unlockChoices: [], displayType: 'coins', displayValue: '150 Coins' },
  { day: 4, coins: 0, xp: 0, aiHelps: 5, unlockChoices: [], displayType: 'help', displayValue: '+5 AI Helps' },
  { day: 5, coins: 200, xp: 0, aiHelps: 0, unlockChoices: [], displayType: 'coins', displayValue: '200 Coins' },
  { day: 6, coins: 0, xp: 0, aiHelps: 0, unlockChoices: ['pern-pos-scenario-3'], fallback: { coins: 300, aiHelps: 12 }, displayType: 'scenario_unlock', displayValue: 'PERN Scenario 3' },
  { day: 7, coins: 0, xp: 0, aiHelps: 7, unlockChoices: [], displayType: 'help', displayValue: '+7 AI Helps' },
  { day: 8, coins: 250, xp: 0, aiHelps: 0, unlockChoices: [], displayType: 'coins', displayValue: '250 Coins' },
  { day: 9, coins: 0, xp: 0, aiHelps: 9, unlockChoices: [], displayType: 'help', displayValue: '+9 AI Helps' },
  { day: 10, coins: 300, xp: 0, aiHelps: 0, unlockChoices: [], displayType: 'coins', displayValue: '300 Coins' },
  { day: 11, coins: 0, xp: 0, aiHelps: 11, unlockChoices: [], displayType: 'help', displayValue: '+11 AI Helps' },
  { day: 12, coins: 0, xp: 0, aiHelps: 0, unlockChoices: ['mern-tw-scenario-3'], fallback: { coins: 400, aiHelps: 16 }, displayType: 'scenario_unlock', displayValue: 'MERN Scenario 3' },
  { day: 13, coins: 400, xp: 0, aiHelps: 0, unlockChoices: [], displayType: 'coins', displayValue: '400 Coins' },
  { day: 14, coins: 0, xp: 0, aiHelps: 13, unlockChoices: [], displayType: 'help', displayValue: '+13 AI Helps' },
  { day: 15, coins: 500, xp: 0, aiHelps: 0, unlockChoices: [], displayType: 'coins', displayValue: '500 Coins' },
  { day: 16, coins: 0, xp: 0, aiHelps: 16, unlockChoices: [], displayType: 'help', displayValue: '+16 AI Helps' },
  { day: 17, coins: 600, xp: 0, aiHelps: 0, unlockChoices: [], displayType: 'coins', displayValue: '600 Coins' },
  { day: 18, coins: 0, xp: 0, aiHelps: 0, unlockChoices: ['nestjs-pos-scenario-3'], fallback: { coins: 550, aiHelps: 22 }, displayType: 'scenario_unlock', displayValue: 'NestJS Scenario 3' },
  { day: 19, coins: 0, xp: 0, aiHelps: 20, unlockChoices: [], displayType: 'help', displayValue: '+20 AI Helps' },
  { day: 20, coins: 700, xp: 0, aiHelps: 0, unlockChoices: [], displayType: 'coins', displayValue: '700 Coins' },
  { day: 21, coins: 0, xp: 0, aiHelps: 24, unlockChoices: [], displayType: 'help', displayValue: '+24 AI Helps' },
  { day: 22, coins: 750, xp: 0, aiHelps: 0, unlockChoices: [], displayType: 'coins', displayValue: '750 Coins' },
  { day: 23, coins: 0, xp: 0, aiHelps: 28, unlockChoices: [], displayType: 'help', displayValue: '+28 AI Helps' },
  { day: 24, coins: 0, xp: 0, aiHelps: 0, unlockChoices: ['nextjs-postgres-prisma-3'], fallback: { coins: 700, aiHelps: 28 }, displayType: 'scenario_unlock', displayValue: 'Next.js + Prisma Scenario 3' },
  { day: 25, coins: 800, xp: 0, aiHelps: 0, unlockChoices: [], displayType: 'coins', displayValue: '800 Coins' },
  { day: 26, coins: 0, xp: 0, aiHelps: 32, unlockChoices: [], displayType: 'help', displayValue: '+32 AI Helps' },
  { day: 27, coins: 900, xp: 0, aiHelps: 0, unlockChoices: [], displayType: 'coins', displayValue: '900 Coins' },
  { day: 28, coins: 0, xp: 0, aiHelps: 35, unlockChoices: [], displayType: 'help', displayValue: '+35 AI Helps' },
  { day: 29, coins: 950, xp: 0, aiHelps: 0, unlockChoices: [], displayType: 'coins', displayValue: '950 Coins' },
  { day: 30, coins: 0, xp: 0, aiHelps: 0, unlockChoices: ['nextjs-shadcn-ui-scenario-3'], fallback: { coins: 900, aiHelps: 36 }, displayType: 'scenario_unlock', displayValue: 'Next.js Shadcn Scenario 3' },
];

/** Number of allowance days in one pass. */
export const PASS_LENGTH = PASS_LADDER.length;

// The reward-day boundary is shared with daily login — see `rewards/reset.ts`.
export { MS_PER_DAY } from '$lib/server/rewards/reset';

const REWARD_BY_DAY = new Map(PASS_LADDER.map((r) => [r.day, r]));

/** Reward for a 1-based allowance day, or `undefined` if out of range. */
export function rewardFor(dayNumber: number): PassReward | undefined {
  return REWARD_BY_DAY.get(dayNumber);
}

/** Days that grant a scenario unlock instead of (or as well as) currency. */
export const SPECIAL_UNLOCK_DAYS: readonly number[] = PASS_LADDER
  .filter((r) => r.unlockChoices.length > 0)
  .map((r) => r.day);

/** Every scenario reachable via the pass. */
export const SCENARIO_3_IDS: ReadonlySet<string> = new Set(
  PASS_LADDER.flatMap((r) => r.unlockChoices),
);

export function getSpecialUnlocksForDay(day: number): string[] {
  return rewardFor(day)?.unlockChoices ?? [];
}

/** Which consolation a user took on a milestone day they already owned. */
export type FallbackKind = 'COINS' | 'AI_HELPS';

/** Fallback rewards for a day, or `undefined` for ordinary days that never need one. */
export function fallbackFor(day: number): { coins: number; aiHelps: number } | undefined {
  return rewardFor(day)?.fallback;
}

/** Amount a fallback pays for the chosen kind, or `undefined` if the day has no fallback. */
export function fallbackAmount(day: number, kind: FallbackKind): number | undefined {
  const fallback = fallbackFor(day);
  if (!fallback) return undefined;
  return kind === 'COINS' ? fallback.coins : fallback.aiHelps;
}

// ────────────────────────────────────────────────────────────────────────────
// Progress derivation
// ────────────────────────────────────────────────────────────────────────────

/** The entitlement half: facts that cannot be derived. */
export interface PassEnrollment {
  created_at: Date;
  expires_at: Date;
}

export interface PassClaimRef {
  dayNumber: number;
  claimedAt: Date;
}

/** The DB row shape, so routes can hand claim rows straight to `toClaimRefs`. */
export interface PassClaimRow {
  day_number: number;
  claimed_at: Date;
}

export function toClaimRefs(rows: PassClaimRow[]): PassClaimRef[] {
  return rows.map((row) => ({ dayNumber: row.day_number, claimedAt: row.claimed_at }));
}

/**
 * Ladder entry in the shape the existing `pass` UI already destructures
 * (`reward_index`, `display_type`, `display_value`). Kept deliberately, so neither
 * `pass/+page.svelte` nor any consumer of `GET /api/user/learner-pass` has to change.
 */
export function toRewardPayload(reward: PassReward) {
  return {
    id: `pass-day-${reward.day}`,
    reward_index: reward.day,
    coins: reward.coins,
    xp: reward.xp,
    ai_helps: reward.aiHelps,
    unlocked_scenario: reward.unlockChoices,
    display_type: reward.displayType,
    display_value: reward.displayValue,
  };
}

export interface PassState {
  status: PassStatus;
  /** 1-based allowance day corresponding to "now". Clamped to PASS_LENGTH. */
  currentDay: number;
  /** Allowance days already claimed, ascending. */
  claimedDays: number[];
  totalClaimedDays: number;
  streak: number;
  lastClaimedAt: Date | null;
  canClaimNow: boolean;
  nextAvailableAt: Date | null;
  daysRemaining: number;
  /** Not expired and not complete. */
  isActive: boolean;
}

/**
 * Streak = the run of consecutive **reward days** ending at the most recent claim.
 *
 * Deliberately identical in shape to the daily-login streak (`deriveStreak` in
 * `dailyRewards/schedule.ts`): a "day" has to mean the same thing in both places. It
 * previously counted UTC calendar days while daily login counted reset-shifted days, so
 * the two features disagreed about which claims were adjacent.
 *
 * No threshold and no elapsed-time arithmetic: a missed reward day is simply an absent day
 * number, so it breaks the run by construction. This also drops the old `getCurrentStreak`
 * rule that zeroed a stale streak — matching daily login, which deliberately keeps a last
 * run until the user claims again.
 */
export function deriveStreak(claims: PassClaimRef[]): number {
  if (claims.length === 0) return 0;

  const days = [...new Set(claims.map((c) => rewardDayNumber(c.claimedAt)))].sort((a, b) => b - a);

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i - 1] - days[i] !== 1) break;
    streak++;
  }
  return streak;
}

/**
 * Whether claiming `day` waits for the reset at all. Past, missed days back-fill freely —
 * only the current day is gated, and by the fixed daily boundary rather than a rolling 24h
 * window. The pass is prepaid, so an unredeemed day is still owed.
 */
export function requiresCooldown(day: number, currentDay: number): boolean {
  return day >= currentDay;
}

export const EMPTY_PASS_STATE: PassState = {
  status: 'INACTIVE',
  currentDay: 1,
  claimedDays: [],
  totalClaimedDays: 0,
  streak: 0,
  lastClaimedAt: null,
  canClaimNow: false,
  nextAvailableAt: null,
  daysRemaining: 0,
  isActive: false,
};

/**
 * Pure derivation shared by the GET route, the claim route, and `/pass`. Everything
 * the client reads is computed here so the API contract has exactly one definition.
 */
export function derivePassState(
  enrollment: PassEnrollment | null,
  claims: PassClaimRef[],
  now: Date,
): PassState {
  if (!enrollment) return EMPTY_PASS_STATE;

  const ordered = [...claims].sort((a, b) => a.claimedAt.getTime() - b.claimedAt.getTime());
  const claimedDays = [...new Set(ordered.map((c) => c.dayNumber))].sort((a, b) => a - b);
  const lastClaimedAt = ordered.length > 0 ? ordered[ordered.length - 1].claimedAt : null;

  const isExpired = now > enrollment.expires_at;
  const isCompleted = claimedDays.length >= PASS_LENGTH;
  const isActive = !isExpired && !isCompleted;

  const status: PassStatus = isCompleted
    ? 'COMPLETED'
    : isExpired
      ? 'EXPIRED'
      : isActive
        ? 'ACTIVE'
        : 'INACTIVE';

  // Day 1 begins on the reward day the pass was created in. The boundary is the fixed daily
  // reset, NOT a 24h window from `created_at`: buying a pass at 15:00 UTC+8 means day 1 ends
  // at 16:00 the same afternoon. Clamped so a long-expired pass never reports past the allowance.
  const elapsedRewardDays = rewardDayNumber(now) - rewardDayNumber(enrollment.created_at);
  const currentDay = Math.min(PASS_LENGTH, Math.max(1, elapsedRewardDays + 1));

  const streak = deriveStreak(ordered);

  // Available exactly when today's reward day has no claim against it. No elapsed-time
  // arithmetic — the same rule the daily-login reset uses, so the two agree on what a day is.
  const today = rewardDayNumber(now);
  const canClaimNow =
    isActive && !ordered.some((c) => rewardDayNumber(c.claimedAt) === today);

  // Points at the next fixed reset rather than the last claim + 24h. Null once the pass is no
  // longer active, so the UI stops offering a countdown for a pass that cannot be claimed.
  const nextAvailableAt = !canClaimNow && isActive ? nextResetAt(now) : null;

  const daysRemaining = Math.max(
    0,
    Math.ceil((enrollment.expires_at.getTime() - now.getTime()) / MS_PER_DAY),
  );

  return {
    status,
    currentDay,
    claimedDays,
    totalClaimedDays: claimedDays.length,
    streak,
    lastClaimedAt,
    canClaimNow,
    nextAvailableAt,
    daysRemaining,
    isActive,
  };
}

/**
 * A claimed milestone day still waiting on its choice, priced by what the user already owns.
 *
 * When `available` is empty the user owns every scenario on offer, so `fallback` is the only
 * thing left to take — that is the whole point of the field, not an edge case.
 */
export interface PendingUnlock {
  day: number;
  /** Scenarios this slot offers, owned or not. */
  offers: string[];
  /** Subset the user can still unlock; empty once they own them all. */
  available: string[];
  fallback?: { coins: number; aiHelps: number };
}

/** A pending entry for one claimed milestone day, or `undefined` for an ordinary day. */
export function pendingUnlockForDay(
  day: number,
  ownedScenarios: ReadonlySet<string>,
): PendingUnlock | undefined {
  const offers = getSpecialUnlocksForDay(day);
  if (offers.length === 0) return undefined;
  return {
    day,
    offers,
    available: offers.filter((id) => !ownedScenarios.has(id)),
    fallback: fallbackFor(day),
  };
}

/**
 * Pending scenario choices: claimed milestone days whose reward has not been taken yet.
 *
 * `ownedScenarios` is user-scoped — every pass the user has ever had — because an unlock
 * outlives the pass that granted it, which is exactly what turns a repeat buyer's milestone
 * day into a fallback choice. `resolvedDays` is the per-day "choice already made" set covering
 * both outcomes (`unlocked_scenario` and `fallback_reward`); without it a day resolved by
 * fallback would resurface as pending forever, since it leaves no `unlocked_scenario` behind.
 */
export function derivePendingUnlocks(
  claimedDays: number[],
  ownedScenarios: ReadonlySet<string>,
  resolvedDays: ReadonlySet<number>,
): PendingUnlock[] {
  const pending: PendingUnlock[] = [];

  for (const day of claimedDays) {
    if (!SPECIAL_UNLOCK_DAYS.includes(day)) continue;
    if (resolvedDays.has(day)) continue;
    const entry = pendingUnlockForDay(day, ownedScenarios);
    if (entry) pending.push(entry);
  }

  return pending;
}
