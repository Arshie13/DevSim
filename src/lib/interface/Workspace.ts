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
}

export interface WorkspaceStackRow {
  id: string;
  workspace_id: string;
  stackName: string;
  stackVersion: string | null;
}
