import type { achievement_tier_level, AchievementCategory, AchievementSnapshotView } from "$types";
import { getAchievementsForUser } from "./catalog";

const TIER_RANK: Record<achievement_tier_level, number> = {
  ROOKIE: 0,
  AMATEUR: 1,
  PRO: 2,
};

/**
 * Return the user's top-N highest-valued unlocked achievements.
 *
 * Ranking rules (in order):
 *   1. Highest unlocked tier (PRO > AMATEUR > ROOKIE)
 *   2. Tiebreaker: max(xpReward, coinReward) of that tier, desc
 */
export async function getTopAchievements(userId: string, count = 3): Promise<AchievementSnapshotView[]> {
  const achievements = await getAchievementsForUser(userId);

  const snapshots: AchievementSnapshotView[] = [];
  for (const a of achievements) {
    const unlockedTiers = a.tiers.filter((t) => t.unlocked);
    if (unlockedTiers.length === 0) continue;

    // Pick the highest unlocked tier for this family.
    const top = unlockedTiers.reduce((best, cur) =>
      TIER_RANK[cur.tier] > TIER_RANK[best.tier] ? cur : best,
    );

    snapshots.push({
      id: a.id,
      name: a.name,
      icon: a.icon,
      category: a.category as AchievementCategory,
      highestTier: top.tier,
      xpReward: top.xpReward,
      coinReward: top.coinReward,
    });
  }

  snapshots.sort((x, y) => {
    const tierDiff = TIER_RANK[y.highestTier] - TIER_RANK[x.highestTier];
    if (tierDiff !== 0) return tierDiff;
    return Math.max(y.xpReward, y.coinReward) - Math.max(x.xpReward, x.coinReward);
  });

  return snapshots.slice(0, count);
}
