import { type ITask } from "./IContainer";

export type SubmitState = 'confirm' | 'testing' | 'loading' | 'success' | 'error';

export interface SubmitRewards {
  xp: number;
  coins: number;
}

export interface FileChangeSummary {
  created: string[];
  modified: string[];
  renamed: { from: string; to: string }[];
  totalChanges: number;
}

export interface TestResult {
  passed: boolean;
  failedTasks: Array<{ taskId: string; taskText: string; errors: string[] }>;
  summary: { total: number; passed: number; failed: number };
  regressed: RegressedTask[];
}

export interface RegressedTask {
  taskId: string;
  taskName: string;
}

export interface AIScoring {
  stars: number;
  score: number;
  feedback: string;
  improvements: string;
  nextTime: string;
  loading: boolean;
  done: boolean;
}

export interface SubmitStep {
  icon: string;
  label: string;
  detail: string;
}

export interface SubmitFlowResult {
  rewards: SubmitRewards;
  advanceToNextLevel: boolean;
  nextLevel: number | null;
  allLevelsComplete: boolean;
}

export interface SubmitSprintProps {
  dbContainerId: string | null;
  containerId: string;
  tasks: ITask[];
  level: number;
  fileContents?: Record<string, string>;
  existingFiles?: string[];
  levelXpReward?: number;
  levelCoinReward?: number;
}
