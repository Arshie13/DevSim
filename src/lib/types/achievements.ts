export type achievement_tier_level = "ROOKIE" | "AMATEUR" | "PRO";

export type AchievementCategory = "progress" | "exploration" | "consistency" | "mastery";

export interface achievement_tier_view {
  id: string;
  tier: achievement_tier_level;
  description: string;
  xpReward: number;
  coinReward: number;
  unlocked: boolean;
  currentValue: number;
  targetValue: number;
  progress: number; // 0..1
}

export interface AchievementView {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tiers: achievement_tier_view[];
}

/**
 * Compact view used in the profile "highest-valued achievements" snapshot.
 * Represents a single family collapsed to its highest unlocked tier.
 */
export interface AchievementSnapshotView {
  id: string;
  name: string;
  icon: string;
  category: AchievementCategory;
  highestTier: achievement_tier_level;
  xpReward: number;
  coinReward: number;
}

/**
 * Feed item for ActivityFeed — families with at least one unlocked tier.
 * isCompleted = true when all tiers (PRO) are unlocked.
 */
export interface AchievementFeedItem {
  id: string;
  name: string;
  icon: string;
  unlockedTier: achievement_tier_level;
  nextTier: achievement_tier_level;
  nextTierDescription: string;
  currentValue: number;
  targetValue: number;
  progress: number; // 0..1 toward nextTier (1 when completed)
  xpReward: number;
  coinReward: number;
  isCompleted: boolean;
}
