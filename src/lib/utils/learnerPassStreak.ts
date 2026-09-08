/**
 * Computes the longest consecutive streak of day numbers in a learner pass
 * enrollment. Day numbers are 1-based (1–30).
 *
 * Because back-filling past days is allowed, the streak is derived from the
 * set of claimed day numbers rather than from claim timestamps. Filling in a
 * skipped day retroactively will extend the streak on the next read.
 *
 * Examples:
 *   [1, 2, 3, 5]      → 3  (run 1→2→3; day 4 skipped)
 *   [1, 2, 3, 4]      → 4
 *   [1, 3, 4, 5]      → 3  (run 3→4→5)
 *   [1, 2, 4, 5, 6]   → 3  (run 4→5→6)
 *   []                → 0
 */
export function computeStreak(claimedDays: number[]): number {
  if (claimedDays.length === 0) return 0;

  const sorted = [...new Set(claimedDays)].sort((a, b) => a - b);

  let best = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      current++;
      if (current > best) best = current;
    } else {
      current = 1;
    }
  }

  return best;
}
