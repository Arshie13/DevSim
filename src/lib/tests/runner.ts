/**
 * Test Runner
 * 
 * Coordinates running tests for level submission validation.
 * This is the main entry point for the testing system.
 */

import { getLevelConfig, getAllLevelConfigs } from './levels/index';
import { validateLevel } from './validator';
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
		// No tests defined for this level - do NOT allow submission without tests
		return {
			success: true,
			level,
			taskResults: [],
			overallResult: {
				passed: false, // Require tests to pass - cannot advance with 0 tests
				results: [],
				summary: { total: 0, passed: 0, failed: 0 }
			},
			failedTasks: [{ taskText: 'No validation tests available for this level', errors: ['Level has no tests configured - cannot verify completion'] }]
		};
	}
	
	// Create a map of file contents for easier lookup
	const contentMap = new Map<string, string>();
	for (const [path, content] of Object.entries(fileContents)) {
		const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
		contentMap.set(path, contentStr);
		// Also add with /workspace/ prefix
		if (!path.startsWith('/workspace/')) {
			contentMap.set('/workspace/' + path, contentStr);
		}
	}
	
	console.log('[TEST RUNNER] Level:', level);
	console.log('[TEST RUNNER] User tasks:', JSON.stringify(tasks));
	console.log('[TEST RUNNER] Level config tasks:', JSON.stringify(levelConfig.tasks.map(t => t.taskText)));
	console.log('[TEST RUNNER] File contents received:', Object.keys(fileContents).length, 'files');
	console.log('[TEST RUNNER] ContentMap keys:', Array.from(contentMap.keys()));
	console.log('[TEST RUNNER] Existing files:', existingFiles?.slice(0, 10) || []);
	
	// Run tests for each USER task that is marked as completed
	// This validates ACTUAL work, not just whether user checked the box
	const taskResults: TestValidationResult[] = [];
	const failedTasks: Array<{ taskId: number; taskText: string; errors: string[] }> = [];
	
	console.log('[TEST RUNNER] Level config tasks:', JSON.stringify(levelConfig.tasks.map(t => ({ id: t.taskId, text: t.taskText }))));
	
	// Validate each user-completed task
	for (const userTask of tasks) {
		console.log(`[TEST RUNNER] Processing user task: "${userTask.text}" (completed: ${userTask.completed})`);
		
		// Find matching level config task - use stricter matching
		const taskConfig = levelConfig.tasks.find(tc => {
			const userText = userTask.text.toLowerCase();
			const configText = tc.taskText.toLowerCase();
			
			// 1. Exact match
			if (userText === configText) return true;
			
			// 2. Very similar - user text contains most of config text or vice versa (80% match)
			if (userText.includes(configText) && configText.length > userText.length * 0.5) return true;
			if (configText.includes(userText) && userText.length > configText.length * 0.5) return true;
			
			// 3. Check for IMPORTANT keywords that should match (not just common words)
			const importantUserWords = userText.split(/\s+/).filter(w => 
				w.length > 4 && !['create', 'simple', 'build', 'implement', 'setup', 'add'].includes(w)
			);
			const importantConfigWords = configText.split(/\s+/).filter(w => 
				w.length > 4 && !['create', 'simple', 'build', 'implement', 'setup', 'add'].includes(w)
			);
			
			// Must have at least one important word in common
			const hasImportantMatch = importantUserWords.some(w => 
				importantConfigWords.some(cw => cw.includes(w) || w.includes(cw))
			);
			
			// Also check that we have reasonable overall similarity
			const userWords = userText.split(/\s+/).filter(w => w.length > 2);
			const configWords = configText.split(/\s+/).filter(w => w.length > 2);
			const matchingWords = userWords.filter(w => configWords.some(cw => cw.includes(w) || w.includes(cw)));
			const similarity = matchingWords.length / Math.max(userWords.length, configWords.length);
			
			return hasImportantMatch && similarity >= 0.5;
		});
		
		if (!taskConfig) {
			console.log(`[TEST RUNNER] No config match for: "${userTask.text}" - skipping validation`);
			continue; // Skip tasks that don't have validation config
		}
		
		console.log(`[TEST RUNNER] Matched "${userTask.text}" to config "${taskConfig.taskText}" - running validation`);
		
		console.log(`[TEST RUNNER] Matched to config: "${taskConfig.taskText}" - running validation`);
		
		// Run the validation for this task - this checks actual file contents!
		const result = await validateLevel(
			[taskConfig],
			contentMap,
			existingFiles
		);
		
		taskResults.push(result);
		
		// Track failed tasks - these are tasks where work was NOT done
		if (!result.passed) {
			const failedTests = result.results.filter(r => !r.passed);
			failedTasks.push({
				taskId: userTask.id,
				taskText: userTask.text,
				errors: failedTests.map(t => t.message)
			});
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
