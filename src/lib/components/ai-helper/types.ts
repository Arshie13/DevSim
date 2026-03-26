export type AiMode = 'chat' | 'quick';

export interface AttachedFile {
  path: string;
  name: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  isWarning?: boolean;
  attachedFiles?: AttachedFile[];
}

export interface AiHelperProps {
  scenario: string;
  tasks: ITask[];
  containerId: string;
  userId: string;
  projectName: string;
  level: number;
  mode?: AiMode;
  initialSelectedFile?: string;
  initialFileTree?: string[];
  initialFileContents?: Record<string, string>;
  initialCoins?: number;
}

// From your existing types
export interface ITask {
  taskName: string;
  isCompleted: boolean;
  // ... other task properties
}