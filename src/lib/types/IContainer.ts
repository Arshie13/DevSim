export interface IContainer {
  id: string;
  containerId: string; // Docker container ID
  status: string;
  level: number;
  scenario: IScenario;
  workspace_stacks?: IContainerStack[];
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

export interface IEpic {
  id: string;
  name: string;
  description: string;
  order: number;
  scenarioId: string;
}

export interface ILevel {
  id: string;
  title: string;
  order: number;
  deadline: Date | null;
  levelDescription: string;
  xpReward: number;
  coinReward: number;
  keyTakeaways: string;
  tasks: ITask[];
}

export interface ITask {
  id: string;
  levelId: string;
  taskName: string;
  userStory: string;
  order: number;
  hints: IHints[];
  acceptanceCriteria: IAcceptanceCriteria[];
  learningSections?: ILearningSection[];

  isCompleted: boolean; // Optional field to track completion status on the client side
  testType: string;
}

export interface ILearningSection {
  id: string;
  title: string;
  content: string;
  order: number;
  taskId: string;
  sectionType: "PLAIN_TEXT" | "INTERACTIVE";
  interactiveMode?: "TERMINAL_CD" | "CODE_EDITOR" | null;
  interactiveConfig?: IInteractiveConfig | null;
}

export interface IInteractiveConfig {
    instructions?: string;
    starter_code?: string;
    entry_point?: string;
    test_cases?: Array<{
      input: unknown[];
      expected: unknown;
      label: string;
    }>;
    required_code_includes?: string[];
    editable_regions?: Array<{
      placeholder: string;
      case_sensitive?: boolean;
    }>;
    expected_commands?: string[];
    initial_directory?: string;
    directory_tree?: Record<string, string[]>;
    language?: string;
  };

  export interface ILearningTask  {
    id: string;
    taskName: string;
    order: number;
    learningSections: ILearningSection[];
  };

export interface IHints {
  id: string;
  taskId: string;
  order: number;
  content: string;
}

export interface IAcceptanceCriteria {
  id: string;
  taskId: string;
  description: string;
  order: number;
  isRequired: boolean;
}