export interface TechOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface TechCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  options: TechOption[];
}

export interface StackSelection {
  id?: string;
  name?: string;
  frontend: string | null;
  backend: string | null;
  database: string | null;
  services: string | null;
}


// Legacy interface kept for compatibility
export interface TechStack {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  levels: number;
  tags: string[];
  sprintLevels?: Array<{
    level: number;
    title: string;
    description: string;
    difficulty: string;
    estimatedTime: string;
    deadline: number;
    tasks: string[];
    rewards: Record<string, number>;
  }>;
}

export interface StackProgress {
  id: string;
  name: string;
  frontend: string;
  backend: string;
  database: string;
  services?: string;
  progress: number;
  currentLevel: number;
  totalLevels: number;
  lastActive: string;
  icon: string;
}

export interface FinishedStack {
  id: string;
  name: string;
  frontend: string;
  backend: string;
  database: string;
  services?: string;
  completedAt: string;
  xpEarned: number;
  coinsEarned: number;
  rating: number;
  icon: string;
}
