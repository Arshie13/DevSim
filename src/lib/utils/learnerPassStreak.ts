const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function utcDay(timestamp: Date): number {
  return Date.UTC(timestamp.getUTCFullYear(), timestamp.getUTCMonth(), timestamp.getUTCDate());
}

/** Returns the streak after a claim made at `now`. */
export function calculateNextStreak(
  currentStreak: number,
  lastClaimedAt: Date | null,
  now: Date,
): number {
  if (!lastClaimedAt) return 1;

  const daysSinceLastClaim = (utcDay(now) - utcDay(lastClaimedAt)) / ONE_DAY_MS;

  if (daysSinceLastClaim === 0) return currentStreak;
  if (daysSinceLastClaim === 1) return currentStreak + 1;
  return 1;
}

/** Returns zero once a user has missed a full UTC calendar day. */
export function getCurrentStreak(
  currentStreak: number,
  lastClaimedAt: Date | null,
  now: Date,
): number {
  if (!lastClaimedAt) return 0;

  const daysSinceLastClaim = (utcDay(now) - utcDay(lastClaimedAt)) / ONE_DAY_MS;
  return daysSinceLastClaim <= 1 ? currentStreak : 0;
}
