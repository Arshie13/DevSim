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
  codingHours: number[];
  days: string[];
  totalHours: number;
  avgPerDay: number;
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