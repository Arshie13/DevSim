// Types
export interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export interface LevelConfig {
  level: number;
  title: string;
  stack: string;
  difficulty: string;
  tasks: Task[];
  scenario: string;
  hints: string[];
  starterFiles: Record<string, any>;
}