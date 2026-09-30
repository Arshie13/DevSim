/**
 * The platform's reward-day boundary — one definition, shared by every reward system.
 *
 * Daily login and the Learner Pass both gate availability on a **fixed daily reset**
 * rather than a rolling 24h window: 16:00 at UTC+8, which is 08:00 UTC.
 *
 * A rolling window has no concept of "a day", which is why the old daily-login
 * 24h-cooldown / 48h-streak-break pair was contradictory — it let a user claim
 * Mon 23:00 then Wed 21:00 (a 46h gap) and keep the streak despite never claiming on
 * Tuesday. A fixed boundary gives "a day" a definition, so availability and streaks
 * can both be expressed in terms of it.
 *
 * This lives in its own module rather than inside either feature: the reset is a
 * platform concept, and having the Learner Pass take its clock from the daily-login
 * module would make two unrelated features depend on each other.
 */

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 16:00 at UTC+8, expressed in UTC. */
export const RESET_HOUR_UTC = 8;

const RESET_OFFSET_MS = RESET_HOUR_UTC * 60 * 60 * 1000;

/** Reset-shifted day number (whole days since epoch) for an instant. */
export function rewardDayNumber(at: Date): number {
  return Math.floor((at.getTime() - RESET_OFFSET_MS) / MS_PER_DAY);
}

/** The `DATE` value to store for a reward-day number. */
export function rewardDayDate(rewardDay: number): Date {
  return new Date(rewardDay * MS_PER_DAY);
}

/**
 * Read a stored `DATE` column back to its reward-day number. The stored value is already
 * reset-shifted, so the offset must NOT be applied a second time.
 */
export function rewardDayFromStoredDate(stored: Date): number {
  return Math.round(stored.getTime() / MS_PER_DAY);
}

/** The instant the next reward becomes available. */
export function nextResetAt(now: Date): Date {
  return new Date((rewardDayNumber(now) + 1) * MS_PER_DAY + RESET_OFFSET_MS);
}
