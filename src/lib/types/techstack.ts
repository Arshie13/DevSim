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
