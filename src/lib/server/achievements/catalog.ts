import prisma from "$lib/server/client";
import type { AchievementCategory, achievement_tier_level, AchievementView, AchievementFeedItem } from "$types";
import { getUserProgressSnapshot, evaluateCriterion } from "./progress";

const TIER_ORDER: Record<achievement_tier_level, number> = {
  ROOKIE: 0,
  AMATEUR: 1,
  PRO: 2,
};

export async function getAchievementsForUser(userId: string): Promise<AchievementView[]> {
  const [achievements, unlocked, snapshot] = await Promise.all([
    prisma.achievement.findMany({
      include: { tiers: true },
      orderBy: { name: "asc" },
    }),
    prisma.user_achievement.findMany({
      where: { user_id: userId },
      select: { achievement_id: true, tier: true },
    }),
    getUserProgressSnapshot(userId),
  ]);

  // Keyed per tier (not per family) so persisting one tier doesn't mark the
  // whole achievement's higher tiers as unlocked.
  const unlockedTiers = new Set(unlocked.map((u) => `${u.achievement_id}:${u.tier}`));

  return achievements.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    icon: a.icon,
    category: a.category as AchievementCategory,
    tiers: a.tiers
      .slice()
      .sort((x, y) => TIER_ORDER[x.tier] - TIER_ORDER[y.tier])
      .map((t) => {
        const { current, target } = evaluateCriterion(t.criteria, snapshot);
        const ratio = target > 0 ? Math.min(1, current / target) : 0;
        const unlocked = unlockedTiers.has(`${a.id}:${t.tier}`) || current >= target;
        return {
          id: t.id,
          tier: t.tier,
          description: t.description,
          xpReward: t.xp_reward,
          coinReward: t.coin_reward,
          unlocked,
          currentValue: current,
          targetValue: target,
          progress: ratio,
        };
      }),
  }));
}

/**
 * Returns the 5 most recently updated achievements (any tier unlocked),
 * including fully completed ones, ordered by earnedAt desc.
 */
export async function getAchievementFeedItems(userId: string, limit = 5): Promise<AchievementFeedItem[]> {
  const [achievements, userAchievements] = await Promise.all([
    getAchievementsForUser(userId),
    prisma.user_achievement.findMany({
      where: { user_id: userId },
      select: { achievement_id: true, created_at: true },
    }),
  ]);

  const earnedAtMap = new Map(userAchievements.map((ua) => [ua.achievement_id, ua.created_at]));

  type Ranked = AchievementFeedItem & { _earnedAt: Date };
  const ranked: Ranked[] = [];

  for (const a of achievements) {
    const unlockedTiers = a.tiers.filter((t) => t.unlocked);
    if (unlockedTiers.length === 0) continue;

    const lockedTiers = a.tiers.filter((t) => !t.unlocked);
    const isCompleted = lockedTiers.length === 0;
    const highestUnlocked = unlockedTiers[unlockedTiers.length - 1];
    const earnedAt = earnedAtMap.get(a.id) ?? new Date(0);

    if (isCompleted) {
      ranked.push({
        id: a.id,
        name: a.name,
        icon: a.icon,
        unlockedTier: highestUnlocked.tier,
        nextTier: highestUnlocked.tier,
        nextTierDescription: highestUnlocked.description,
        currentValue: highestUnlocked.currentValue,
        targetValue: highestUnlocked.targetValue,
        progress: 1,
        xpReward: highestUnlocked.xpReward,
        coinReward: highestUnlocked.coinReward,
        isCompleted: true,
        _earnedAt: earnedAt,
      });
    } else {
      const nextTier = lockedTiers[0];
      ranked.push({
        id: a.id,
        name: a.name,
        icon: a.icon,
        unlockedTier: highestUnlocked.tier,
        nextTier: nextTier.tier,
        nextTierDescription: nextTier.description,
        currentValue: nextTier.currentValue,
        targetValue: nextTier.targetValue,
        progress: nextTier.progress,
        xpReward: nextTier.xpReward,
        coinReward: nextTier.coinReward,
        isCompleted: false,
        _earnedAt: earnedAt,
      });
    }
  }

  ranked.sort((a, b) => b._earnedAt.getTime() - a._earnedAt.getTime());
  return ranked.slice(0, limit).map(({ _earnedAt, ...item }) => item);
}
