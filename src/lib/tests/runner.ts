/**
 * Test Runner
 * 
 * Coordinates running tests for level submission validation.
 * This is the main entry point for the testing system.
 */

import { getLevelConfig, getAllLevelConfigs } from './levels/index';
import { validateLevel, validateTasksCompleted } from './validator';
import type { 
	LevelTestConfig, 
	TestValidationResult, 
	TaskTest 
} from './types';

export interface RunTestsParams {
	level: number;
	tasks: Array<{ id: number; text: string; completed: boolean }>;
	fileContents: Record<string, string>;
	existingFiles: string[];
}

export interface RunTestsResult {
	success: boolean;
	level: number;
	taskResults: TestValidationResult[];
	overallResult: TestValidationResult;
	failedTasks: Array<{
		taskId: number;
		taskText: string;
		errors: string[];
	}>;
}

/**
 * Runs all tests for a level submission
 */
export async function runLevelTests(params: RunTestsParams): Promise<RunTestsResult> {
	const { level, tasks, fileContents, existingFiles } = params;
	
	// Get level configuration
	const levelConfig = getLevelConfig(level);
	
	if (!levelConfig) {
		// No tests defined for this level - allow submission
		return {
			success: true,
			level,
			taskResults: [],
			overallResult: {
				passed: true,
				results: [],
				summary: { total: 0, passed: 0, failed: 0 }
			},
			failedTasks: []
		};
	}
	
	// Create a map of file contents for easier lookup
	const contentMap = new Map<string, string>();
	for (const [path, content] of Object.entries(fileContents)) {
		const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
		contentMap.set(path, contentStr);
		// Also add without /workspace/ prefix
		if (path.startsWith('/workspace/')) {
			contentMap.set(path.replace('/workspace/', ''), contentStr);
		}
	}
	
	// Run tests for each task
	const taskResults: TestValidationResult[] = [];
	const failedTasks: Array<{ taskId: number; taskText: string; errors: string[] }> = [];
	
	// First validate that tasks are marked as completed
	const completedCheck = validateTasksCompleted(tasks);
	const incompleteTasks = completedCheck.filter(r => !r.passed);
	
	if (incompleteTasks.length > 0) {
		// Some tasks are not completed - fail the submission
		return {
			success: false,
			level,
			taskResults: [],
			overallResult: {
				passed: false,
				results: completedCheck,
				summary: {
					total: completedCheck.length,
					passed: completedCheck.length - incompleteTasks.length,
					failed: incompleteTasks.length
				}
			},
			failedTasks: incompleteTasks.map(t => ({
				taskId: parseInt(t.testId.replace('task-', '')),
				taskText: t.testName.replace('Task completed: ', ''),
				errors: [t.message]
			}))
		};
	}
	
	// Run validation tests for each completed task
	for (const task of tasks) {
		if (!task.completed) continue;
		
		// Find the test config for this task
		const taskConfig = levelConfig.tasks.find(t => 
			t.taskText.toLowerCase() === task.text.toLowerCase() ||
			t.taskText.includes(task.text) ||
			task.text.includes(t.taskText)
		);
		
		if (taskConfig) {
			// Run the validation for this task
			const result = await validateLevel(
				[taskConfig],
				contentMap,
				existingFiles
			);
			
			taskResults.push(result);
			
			// Track failed tasks
			if (!result.passed) {
				const failedTests = result.results.filter(r => !r.passed);
				failedTasks.push({
					taskId: task.id,
					taskText: task.text,
					errors: failedTests.map(t => t.message)
				});
			}
		}
	}
	
	// Calculate overall result
	const allResults = taskResults.flatMap(r => r.results);
	const totalPassed = allResults.filter(r => r.passed).length;
	const totalFailed = allResults.filter(r => !r.passed).length;
	
	const overallResult: TestValidationResult = {
		passed: totalFailed === 0,
		results: allResults,
		summary: {
			total: allResults.length,
			passed: totalPassed,
			failed: totalFailed
		}
	};
	
	return {
		success: totalFailed === 0,
		level,
		taskResults,
		overallResult,
		failedTasks
	};
}

/**
 * Gets the test configuration for a level
 */
export function getTestsForLevel(level: number): LevelTestConfig | undefined {
	return getLevelConfig(level);
}

/**
 * Gets all available tests
 */
export function getAllTests(): LevelTestConfig[] {
	return getAllLevelConfigs();
}

export { getLevelConfig, getAllLevelConfigs };
export type { LevelTestConfig, TestValidationResult, TaskTest };
