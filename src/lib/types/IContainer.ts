export interface IContainer {
  id: string;
  containerId: string; // Docker container ID
  status: string;
  level: number;
  scenario: IScenario;
  containerStacks: IContainerStack[];
  isArchived?: boolean;
  volumeName?: string;
}

export interface IScenario {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  levels: ILevel[];
}

export interface IContainerStack {
  id: string;
  stackName: string;
  stackVersion?: string;
}

export interface ILevel {
  id: string;
  title: string;
  order: number;
  deadline: Date | null;
  levelDescription: string;
  xpReward: number;
  coinReward: number;
  tasks: ITask[];
}

export interface ITask {
  id: string;
  taskName: string;
  order: number;
  hints: IHints[];
  acceptanceCriteria: IAcceptanceCriteria[];
  learningSections?: ILearningSection[];
  isCompleted: boolean; // Optional field to track completion status on the client side
  testType: string;
  userStory: string;
}

export interface ILearningSection {
  id: string;
  title: string;
  content: string;
  order: number;
  taskId: string;
  sectionType: "PLAIN_TEXT" | "INTERACTIVE";
  interactiveMode?: "TERMINAL_CD" | "CODE_EDITOR" | null;
  interactiveConfig?: {
    instructions?: string;
    starterCode?: string;
    entryPoint?: string;
    testCases?: Array<{
      input: unknown[];
      expected: unknown;
      label: string;
    }>;
    requiredCodeIncludes?: string[];
    editableRegions?: Array<{
      placeholder: string;
      caseSensitive?: boolean;
    }>;
    expectedCommands?: string[];
    initialDirectory?: string;
    directoryTree?: Record<string, string[]>;
    language?: string;
  } | null;
}

  export interface ILearningTask  {
    id: string;
    taskName: string;
    order: number;
    learningSections: ILearningSection[];
  };

export interface IHints {
  id: string;
  order: number;
  taskId: string;
  content: string;
}

export interface IAcceptanceCriteria {
  id: string;
  description: string;
  order: number;
  taskId: string;
  isRequired: boolean;
}