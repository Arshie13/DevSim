export type KanbanStatus = 'backlog' | 'in-progress' | 'in-review' | 'done';

export interface KanbanTask {
  id: string;
  text: string;
  status: KanbanStatus;
  taskType: string;
  userStory: string;
  acceptanceCriteria: string[];
  hints: string[];
}