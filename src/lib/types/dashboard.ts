export interface ActivityItem {
  id: string;
  type: 'achievement' | 'level_up' | 'stack_complete' | 'daily_login' | 'challenge';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  xp?: number;
  coins?: number;
}

export interface WeeklyStats {
  counts: number[];
  days: string[];
  total: number;
  avgPerDay: number;
  growthLabel?: string;
}

export interface KPIData {
  id: string;
  label: string;
  value: number | string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  xp: number;
  level: number;
  isCurrentUser?: boolean;
}

export interface UserKpis {
  stacksCompleted: number;
  totalXp: number;
  dayStreak: number;
  achievementsUnlocked: number;
}

export interface RivalEntry {
  id: string;
  username: string;
  name: string;
  image: string | null;
  xp: number;
  level: number;
}

export interface ProfileMetricsData {
  tasksCompleted: number;
  fileEdits: number;
  coinsEarned: number;
  achievementsCount: number;
  memberSince: Date;
  dayStreak: number;
  leaderboardRank: number;
  weeklyGrowth: string;
}

export interface LandingStats {
  activeDevs: string;
  techStacks: string;
  scenarios: string;
  rating: string;
}
