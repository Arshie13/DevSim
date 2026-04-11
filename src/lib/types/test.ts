  import type { ITask } from '$lib/types';
  
  export interface TestResult {
    testId: string;
    testName: string;
    passed: boolean;
    message: string;
    duration?: number;
    details?: Record<string, unknown>;
  }

  export interface TaskTestResult {
    taskId: string;
    taskName: string;
    keyTakeaway?: string;
    keyTakeaways?: Array<{ taskName: string; takeaway: string }>;
    passed: boolean;
    results: TestResult[];
    errors: string[];
  }

  export interface TestRunResult {
    success: boolean;
    level: number;
    summary: {
      total: number;
      passed: number;
      failed: number;
      duration: number;
    }
    taskResults: TaskTestResult[];
    command?: string;
    output?: string;
}

  export interface TestableTask extends ITask {
    hasClientTest?: boolean;
    hasServerTest?: boolean;
    testStatus?: 'pending' | 'running' | 'passed' | 'failed';
  }

  export interface TestRunRequest {
  command: string;
  level: number;
  taskId?: string;
    taskOrder?: number;
  taskIds?: string[];
  type: 'task' | 'level';
}

export interface TestRunResponse {
  success: boolean;
  passed: boolean;
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
  results: TestResult[];
  taskResults?: TaskTestResult[];
  allKeyTakeaways?: Array<{ taskId: string; taskName: string; takeaway: string }>;
  output: string;
  errors?: string[];
  message?: string;
}
