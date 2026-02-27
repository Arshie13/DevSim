export interface UserData {
  name: string;
  level: number;
  exp: number;
  nextLevelExp: number;
  coins: number;
  avatar: string;
  completedStacks: string[];
  currentStacks: Array<{
    stackId: string;
    currentLevel: number;
    completed: boolean;
  }>;
}