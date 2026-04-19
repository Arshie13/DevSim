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
  level_description: string;
  xp_reward: number;
  coin_reward: number;
  tasks: ITask[];
}

export interface ITask {
  level_id: string;
  id: string;
  task_name: string;
  order: number;
  hints: IHints[];
  acceptance_criteria: IAcceptanceCriteria[];
  is_complete: boolean; // Optional field to track completion status on the client side
  test_type: string;
  user_story: string;
}

export interface IHints {
  id: string;
  order: number;
  task_id: string;
  content: string;
}

export interface IAcceptanceCriteria {
  id: string;
  description: string;
  order: number;
  taskId: string;
  isRequired: boolean;
}