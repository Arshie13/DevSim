export interface LearnerPassRewardLike {
  unlocked_scenario?: string[];
  unlocks?: string[];
}

export function getRewardUnlockIds(reward: LearnerPassRewardLike | null | undefined): string[] {
  if (!reward) return [];

  if (Array.isArray(reward.unlocked_scenario)) {
    return reward.unlocked_scenario;
  }

  if (Array.isArray(reward.unlocks)) {
    return reward.unlocks;
  }

  return [];
}
