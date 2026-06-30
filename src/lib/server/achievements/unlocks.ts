import prisma from "$lib/server/client";
import type { achievement_tier_level } from "$types";
import { getUserProgressSnapshot, evaluateCriterion } from "./progress";

export interface UnlockedAchievement {
  achievementId: string;
  name: string;
  icon: string;
  tier: achievement_tier_level;
  tierDescription: string;
  xpReward: number;
  coinReward: number;
}

/**
 * Recomputes the user's progress snapshot, finds every achievement tier whose
 * criteria are now satisfied but not yet persisted, writes the new ones to
 * `user_achievement`, and returns them so the caller can surface a toast.
 *
 * Idempotent: tiers already recorded for the user are skipped, and the insert
 * uses `skipDuplicates`, so calling this repeatedly (e.g. once per submitted
 * task) never double-fires or violates the unique constraint.
 */
export async function detectNewlyUnlockedAchievements(
  userId: string,
): Promise<UnlockedAchievement[]> {
  const [achievements, existing, snapshot] = await Promise.all([
    prisma.achievement.findMany({ include: { tiers: true } }),
    prisma.user_achievement.findMany({
      where: { user_id: userId },
      select: { achievement_tier_id: true },
    }),
    getUserProgressSnapshot(userId),
  ]);

  const alreadyUnlocked = new Set(
    existing.map((e) => e.achievement_tier_id),
  );

  const newlyUnlocked: UnlockedAchievement[] = [];
  const rows: { user_id: string; achievement_tier_id: string }[] = [];

  for (const a of achievements) {
    for (const t of a.tiers) {
      if (alreadyUnlocked.has(t.id)) continue;

      const { current, target } = evaluateCriterion(t.criteria, snapshot);
      if (current < target) continue;

      rows.push({
        user_id: userId,
        achievement_tier_id: t.id,
      });
      newlyUnlocked.push({
        achievementId: a.id,
        name: a.name,
        icon: a.icon,
        tier: t.tier as achievement_tier_level,
        tierDescription: t.description,
        xpReward: t.xp_reward,
        coinReward: t.coin_reward,
      });
    }
  }

  if (rows.length > 0) {
    await prisma.user_achievement.createMany({
      data: rows,
      skipDuplicates: true,
    });

    const totalXp = newlyUnlocked.reduce((sum, r) => sum + r.xpReward, 0);
    const totalCoins = newlyUnlocked.reduce((sum, r) => sum + r.coinReward, 0);

    if (totalXp > 0 || totalCoins > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: totalXp },
          coins: { increment: totalCoins },
        },
      });
    }
  }

  return newlyUnlocked;
}
