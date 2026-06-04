// Learner's Pass Store - Global state management for the pass system
import { writable, derived } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';

// Types matching the API responses
export type SeasonInfo = {
  id: string;
  name: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

export type LevelInfo = {
  level: number;
  xpToNext: number;
  isMaxLevel: boolean;
};

export type ProgressionInfo = {
  seasonXp: number;
  freeTrackLevel: number;
  premiumTrackLevel: number | null;
  levelInfo: LevelInfo;
};

export type RewardInfo = {
  id: string;
  level: number;
  rewardType: string;
  rewardValue: any;
  xpRequired: number;
  isClaimable: boolean;
  isUnlocked: boolean;
  claimed: boolean;
  requiresPremium: boolean;
};

export type PassStatus = {
  hasPremium: boolean;
  expiresAt: Date | null;
};

export type PassData = {
  season: SeasonInfo;
  progression: ProgressionInfo;
  availableRewards: {
    free: RewardInfo[];
    premium: RewardInfo[];
  };
  premium: PassStatus;
};

// Store for raw pass data from API
export const passData: Writable<PassData | null> = writable(null);

// Store for loading state
export const passLoading: Writable<boolean> = writable(true);

// Store for errors
export const passError: Writable<string | null> = writable(null);

// Store for season timer (days remaining)
export const daysRemaining: Writable<number> = writable(0);

// Store for user's AI helps remaining (integrated with existing aiHelpsRemaining)
export const aiHelpsRemainingPass: Writable<{ today: number; total: number }> = writable({ today: 5, total: 5 });

// Derived store: whether user has premium access
export const hasPremium: Readable<boolean> = derived(passData, $passData => 
  $passData?.premium.hasPremium ?? false
);

// Derived store: current free track level
export const currentFreeLevel: Readable<number> = derived(passData, $passData =>
  $passData?.progression.freeTrackLevel ?? 1
);

// Derived store: current season XP
export const currentSeasonXp: Readable<number> = derived(passData, $passData =>
  $passData?.progression?.seasonXp ?? 0
);

// Derived store: XP progress percentage to next level
export const xpProgressPercent: Readable<number> = derived(
  [passData, currentSeasonXp],
  ([$passData, $currentSeasonXp]) => {
    if (!$passData || !$passData.progression?.levelInfo) return 0;
    const { levelInfo } = $passData.progression;
    if (levelInfo.isMaxLevel) return 100;
    
    const currentLevelThreshold = getThresholdForLevel(levelInfo.level);
    const nextLevelThreshold = getThresholdForLevel(levelInfo.level + 1);
    
    if (currentLevelThreshold === null || nextLevelThreshold === null) return 0;
    
    const xpInCurrentLevel = $currentSeasonXp - currentLevelThreshold;
    const xpNeededForNextLevel = nextLevelThreshold - currentLevelThreshold;
    
    return Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));
  }
);

// Helper function to get XP threshold for a level (matches PassProgressionService table)
function getThresholdForLevel(level: number): number | null {
  const XP_PER_LEVEL_TABLE: Record<number, number> = {
    1: 0,
    2: 100,
    3: 250,
    4: 450,
    5: 700,
    6: 1000,
    7: 1350,
    8: 1750,
    9: 2200,
    10: 2700,
    11: 3250,
    12: 3850,
    13: 4500,
    14: 5200,
    15: 5950,
    16: 6750,
    17: 7600,
    18: 8500,
    19: 9450,
    20: 10450
  };
  return XP_PER_LEVEL_TABLE[level] ?? null;
}

// Derived store: count of unclaimed rewards
export const unclaimedRewardsCount: Readable<{ free: number; premium: number }> = derived(
  passData,
  $passData => {
    if (!$passData) return { free: 0, premium: 0 };
    
    const freeUnclaimed = $passData.availableRewards.free.filter(r => r.isUnlocked && !r.claimed).length;
    const premiumUnclaimed = $passData.availableRewards.premium.filter(r => r.isUnlocked && !r.claimed).length;
    
    return { free: freeUnclaimed, premium: premiumUnclaimed };
  }
);

// Actions to update store state
export function setPassData(data: PassData) {
  passData.set(data);
  passError.set(null);
}

export function setPassLoading(loading: boolean) {
  passLoading.set(loading);
}

export function setPassError(error: string) {
  passError.set(error);
  passLoading.set(false);
}

export function updateDaysRemaining(days: number) {
  daysRemaining.set(days);
}

export function updateAIHelpsRemaining(today: number, total: number) {
  aiHelpsRemainingPass.set({ today, total });
}

export function clearPassData() {
  passData.set(null);
  passError.set(null);
  passLoading.set(false);
  daysRemaining.set(0);
}
