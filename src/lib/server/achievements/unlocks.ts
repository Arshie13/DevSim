import prisma from "$lib/server/client";
import type { achievement_tier_level } from "$types";
import { ALL_TIER_DEFS, tierKey, type ResolvedTier } from "./definitions";
import { getUserProgressSnapshot, evaluateCriterion } from "./progress";

export interface UnlockedAchievement {
  achievementKey: string;
  name: string;
  icon: string;
  tier: achievement_tier_level;
  tierDescription: string;
  xpReward: number;
  coinReward: number;
}

/**
 * Recomputes the user's progress snapshot, finds every catalog tier whose
 * criteria are now satisfied but not yet recorded, persists the new unlocks to
 * `user_achievements`, and returns them so the caller can surface a toast.
 *
 * Idempotent and race-safe:
 *  - Tiers already recorded for the user are skipped before evaluation.
 *  - The insert relies on the `(user_id, family, tier)` primary key together with
 *    `skipDuplicates`, so concurrent callers cannot create duplicate rows.
 *  - The XP/coin grant is derived from the rows the database *actually inserted*
 *    (`createManyAndReturn`), NOT from the locally computed candidate list.
 *    Previously two overlapping calls could both increment the reward for the
 *    same unlock — and this runs on every navigation via `+layout.server.ts`.
 *    The insert and the grant share one transaction, so a failure between them
 *    rolls back instead of losing the reward permanently.
 */
export async function detectNewlyUnlockedAchievements(
  userId: string,
): Promise<UnlockedAchievement[]> {
  const [existing, snapshot] = await Promise.all([
    prisma.user_achievement.findMany({
      where: { user_id: userId },
      select: { family: true, tier: true },
    }),
    getUserProgressSnapshot(userId),
  ]);

  const alreadyUnlocked = new Set(existing.map((e) => tierKey(e.family, e.tier)));

  const candidates: ResolvedTier[] = [];
  for (const def of ALL_TIER_DEFS) {
    if (def.retired) continue;
    if (alreadyUnlocked.has(def.key)) continue;

    const { current, target } = evaluateCriterion(def.criteria, snapshot);
    if (current < target) continue;

    candidates.push(def);
  }

  if (candidates.length === 0) return [];

  const grantedKeys = await prisma.$transaction(async (tx) => {
    const inserted = await tx.user_achievement.createManyAndReturn({
      data: candidates.map((c) => ({
        user_id: userId,
        family: c.family,
        tier: c.tier,
        xp_awarded: c.xpReward,
        coins_awarded: c.coinReward,
      })),
      skipDuplicates: true,
      select: { family: true, tier: true, xp_awarded: true, coins_awarded: true },
    });

    if (inserted.length > 0) {
      const totalXp = inserted.reduce((sum, r) => sum + r.xp_awarded, 0);
      const totalCoins = inserted.reduce((sum, r) => sum + r.coins_awarded, 0);

      if (totalXp > 0 || totalCoins > 0) {
        await tx.user.update({
          where: { id: userId },
          data: {
            xp: { increment: totalXp },
            coins: { increment: totalCoins },
          },
        });
      }
    }

    return inserted.map((r) => tierKey(r.family, r.tier));
  });

  // Only report unlocks this call actually wrote, so the toast matches the DB.
  const granted = new Set(grantedKeys);
  return candidates
    .filter((c) => granted.has(c.key))
    .map((c) => ({
      achievementKey: c.key,
      name: c.name,
      icon: c.icon,
      tier: c.tier,
      tierDescription: c.tierDescription,
      xpReward: c.xpReward,
      coinReward: c.coinReward,
    }));
}
