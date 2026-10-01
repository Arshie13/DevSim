import prisma from "$lib/server/client";
import type { AchievementView, AchievementFeedItem } from "$types";
import { getActiveFamilies, tierKey, TIER_ORDER } from "./definitions";
import { getUserProgressSnapshot, evaluateCriterion } from "./progress";

export async function getAchievementsForUser(userId: string): Promise<AchievementView[]> {
  const [unlocked, snapshot] = await Promise.all([
    prisma.user_achievement.findMany({
      where: { user_id: userId },
      select: { family: true, tier: true },
    }),
    getUserProgressSnapshot(userId),
  ]);

  const unlockedKeys = new Set(unlocked.map((u) => tierKey(u.family, u.tier)));

  return getActiveFamilies().map((family) => ({
    id: family.key,
    name: family.name,
    description: family.description,
    icon: family.icon,
    category: family.category,
    tiers: family.tiers
      .slice()
      .sort((x, y) => TIER_ORDER[x.tier] - TIER_ORDER[y.tier])
      .map((t) => {
        const key = tierKey(family.key, t.tier);
        const { current, target } = evaluateCriterion(t.criteria, snapshot);
        const ratio = target > 0 ? Math.min(1, current / target) : 0;
        return {
          id: key,
          tier: t.tier,
          description: t.description,
          xpReward: t.xpReward,
          coinReward: t.coinReward,
          unlocked: unlockedKeys.has(key),
          currentValue: current,
          targetValue: target,
          progress: ratio,
        };
      }),
  }));
}

/**
 * Returns the 5 most recently earned achievements (any tier unlocked),
 * ordered by earn time desc.
 */
export async function getAchievementFeedItems(userId: string, limit = 5): Promise<AchievementFeedItem[]> {
  const [achievements, userAchievements] = await Promise.all([
    getAchievementsForUser(userId),
    prisma.user_achievement.findMany({
      where: { user_id: userId },
      select: { family: true, tier: true, earned_at: true },
    }),
  ]);

  const earnedAtMap = new Map(
    userAchievements.map((ua) => [tierKey(ua.family, ua.tier), ua.earned_at]),
  );

  type Ranked = AchievementFeedItem & { _earnedAt: Date };
  const ranked: Ranked[] = [];

  for (const a of achievements) {
    const unlockedTiers = a.tiers.filter((t) => t.unlocked);
    if (unlockedTiers.length === 0) continue;

    const lockedTiers = a.tiers.filter((t) => !t.unlocked);
    const isCompleted = lockedTiers.length === 0;
    const highestUnlocked = unlockedTiers[unlockedTiers.length - 1];
    const earnedAt = earnedAtMap.get(highestUnlocked.id) ?? new Date(0);

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
