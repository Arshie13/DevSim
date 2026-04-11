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
  isCompleted: boolean; // Optional field to track completion status on the client side
  testType: string;
}

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