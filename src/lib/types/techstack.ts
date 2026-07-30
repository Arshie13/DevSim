export interface TechOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  /** Array of URLs to preview screenshots showcasing different pages/views of completed project */
  previewImages?: string[];
  /** Brief description of what learners will build */
  finalProjectDescription?: string;
  /** Prerequisites the learner should know before starting this technology */
  prerequisites?: string[];
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
  stackType?: 'fullstack' | 'backend' | 'frontend';
  comingSoon?: boolean;
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

export type StackStatus = FinishedStack

export interface ScenarioMeta {
  /** e.g., "pern-lb-scenario-1" */
  id: string;
  /** e.g., 1 */
  number: number;
  /** Human-readable title, e.g., "POS System" */
  title: string;
  /** First paragraph from project.md */
  description: string;
  /** Difficulty label, e.g., "Easy → Master" or "Medium" */
  difficulty: string;
  /** Number of levels defined in levels.md */
  levelCount: number;
  /** Name of the project subfolder, e.g., "pos-system" */
  projectFolder: string;
  /** Whether a non-empty levels.md exists */
  hasLevels: boolean;
  /** Array of preview image URLs showcasing different pages of the finished project */
  previewImages?: string[];
  /** Epic data for sprint structure */
  epics?: EpicMeta[];
  /** Whether this scenario is locked behind the paywall */
  isLocked?: boolean;
}

export interface EpicMeta {
  id: string;
  name: string;
  description: string;
  sprintNumber: number;
  levelCount: number;
}
