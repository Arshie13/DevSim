import prisma from "$lib/server/client";
import { getUserProgressSnapshot, evaluateCriterion } from "./progress";

export interface UnlockedAchievement {
  name: string;
  icon: string;
  tier: string;
  xpReward: number;
  coinReward: number;
}

/**
 * Checks all achievement tiers for the user, unlocks any newly met criteria,
 * awards XP and coins for each new unlock, and returns the newly unlocked list.
 */
export async function unlockNewAchievements(userId: string): Promise<UnlockedAchievement[]> {
  const [achievements, alreadyUnlocked, snapshot] = await Promise.all([
    prisma.achievement.findMany({ include: { tiers: true } }),
    prisma.user_achievement.findMany({
      where: { user_id: userId },
      select: { achievement_id: true, tier: true },
    }),
    getUserProgressSnapshot(userId),
  ]);

  const unlockedSet = new Set(alreadyUnlocked.map((u) => `${u.achievement_id}:${u.tier}`));

  const newlyUnlocked: UnlockedAchievement[] = [];

  for (const achievement of achievements) {
    for (const tier of achievement.tiers) {
      const key = `${achievement.id}:${tier.tier}`;
      if (unlockedSet.has(key)) continue;

      const { current, target } = evaluateCriterion(tier.criteria, snapshot);
      if (current < target) continue;

      await prisma.$transaction([
        prisma.user_achievement.create({
          data: {
            user_id: userId,
            achievement_id: achievement.id,
            tier: tier.tier,
            description: tier.description,
            icon: achievement.icon,
            criteria: tier.criteria as object,
            xp_reward: tier.xp_reward,
            coin_reward: tier.coin_reward,
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: tier.xp_reward },
            coins: { increment: tier.coin_reward },
          },
        }),
      ]);

      newlyUnlocked.push({
        name: achievement.name,
        icon: achievement.icon,
        tier: tier.tier,
        xpReward: tier.xp_reward,
        coinReward: tier.coin_reward,
      });
    }
  }

  return newlyUnlocked;
}
