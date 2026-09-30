import prisma from "$lib/server/client";
import {
  deriveCycleState,
  deriveStreak,
  toClaimRefs,
  type CycleState,
} from "./schedule";

/**
 * Reads for the daily-login claim history.
 *
 * There is deliberately no parent row to read: `streak` and the availability rule
 * are both derived from these claims. Keep every read going through here so the
 * derivation stays in one place.
 */
async function getClaims(userId: string) {
  return prisma.daily_login_claim.findMany({
    where: { user_id: userId },
    select: {
      cycle_index: true,
      day_index: true,
      claimed_on: true,
      claimed_at: true,
    },
  });
}

/** Full derived state: ladder position, cooldown, and streak. */
export async function getDailyLoginState(
  userId: string,
  now: Date = new Date(),
): Promise<CycleState> {
  return deriveCycleState(toClaimRefs(await getClaims(userId)), now);
}

/**
 * Consecutive reward-day streak, spanning cycles. Derived from the claim dates
 * rather than read from a stored counter — see `deriveStreak`.
 */
export async function getLoginStreak(userId: string): Promise<number> {
  return deriveStreak(toClaimRefs(await getClaims(userId)));
}
