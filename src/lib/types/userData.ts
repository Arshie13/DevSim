export interface UserData {
  name: string;
  level: number;
  exp: number;
  nextLevelExp: number;
  coins: number;
  /** Path or identifier of the currently equipped avatar */
  avatar: string;
  /** Paths of all avatars the user owns (defaults are always included) */
  ownedAvatars: string[];
  completedStacks: string[];
  currentStacks: Array<{
    stackId: string;
    currentLevel: number;
    completed: boolean;
  }>;
}