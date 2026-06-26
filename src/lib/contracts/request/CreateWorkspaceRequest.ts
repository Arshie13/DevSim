import type { StackSelection } from "$lib/types/techstack";

export interface CreateWorkspaceRequest {
  userId: string;
  stackName: string;
  level: number;
  stacks: StackSelection;
  scenarioId: string;
  projectFolder: string;
  scenarioTitle: string;
  mode?: 'tutorial' | 'workspace' | 'sandbox';
}
