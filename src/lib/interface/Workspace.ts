export interface WorkspaceRow {
  id: string;
  user_id: string;
  level: number;
  status: string;
  container_id: string;
  current_scenario_id: string;
  startedAt: Date;
  stoppedAt: Date | null;
  volume_name: string | null;
  is_archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  stack_name: string | null;
  stack_version: string | null;
}
