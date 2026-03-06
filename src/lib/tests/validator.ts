/**
 * Level Test Validator
 * 
 * This module contains the validation logic for running tests against
 * user-submitted work. It validates file existence, content patterns,
 * and other criteria.
 */

import type { 
	TestResult, 
	TestValidationResult, 
	TaskTest, 
	FileValidationResult 
} from './types';

/**
 * Validates that a file exists in the workspace
 */
export async function validateFileExists(
	filePath: string,
	existingFiles: string[]
): Promise<FileValidationResult> {
	const normalizedPath = filePath.startsWith('/workspace/') 
		? filePath 
		: `/workspace/${filePath}`;
	
	const exists = existingFiles.some(f => 
		f === normalizedPath || 
		f.endsWith(normalizedPath) ||
		normalizedPath.endsWith(f)
	);
	
	return {
		path: filePath,
		exists,
		errors: exists ? undefined : [`File not found: ${filePath}`]
	};
}

/**
 * Validates that file content matches expected patterns
 */
export function validateContentPatterns(
	content: string,
	patterns: Array<{ pattern: string; description: string }>
): TestResult[] {
	const results: TestResult[] = [];
	
	for (const { pattern, description } of patterns) {
		try {
			const regex = new RegExp(pattern, 'i');
			const matches = regex.test(content);
			
			results.push({
				testId: `pattern-${description.toLowerCase().replace(/\s+/g, '-')}`,
				testName: description,
				passed: matches,
				message: matches 
					? `Found: ${description}` 
					: `Missing: ${description}`,
				details: { pattern, content: content.substring(0, 200) }
			});
		} catch (e) {
			results.push({
				testId: `pattern-error-${Date.now()}`,
				testName: description,
				passed: false,
				message: `Invalid pattern: ${String(e)}`,
				details: { pattern }
			});
		}
	}
	
	return results;
}

/**
 * Validates a single task based on test configuration
 */
export async function validateTask(
	task: TaskTest,
	fileContents: Map<string, string>,
	existingFiles: string[]
): Promise<TestResult[]> {
	const results: TestResult[] = [];
	
	// Test 1: Required files exist
	if (task.requiredFiles && task.requiredFiles.length > 0) {
		for (const filePath of task.requiredFiles) {
			const fileResult = await validateFileExists(filePath, existingFiles);
			
			results.push({
				testId: `file-${filePath}`,
				testName: `File exists: ${filePath}`,
				passed: fileResult.exists,
				message: fileResult.exists 
					? `✓ File exists: ${filePath}` 
					: `✗ File missing: ${filePath}`,
				details: { path: filePath }
			});
		}
	}
	
	// Test 2: Content patterns
	if (task.requiredPatterns && task.requiredPatterns.length > 0) {
		// Check each required file for patterns
		if (task.requiredFiles) {
			for (const filePath of task.requiredFiles) {
				const content = fileContents.get(filePath) || fileContents.get(`/workspace/${filePath}`);
				
				if (content) {
					const patternResults = validateContentPatterns(content, task.requiredPatterns);
					results.push(...patternResults);
				} else {
					results.push({
						testId: `content-missing-${filePath}`,
						testName: `Content validation for ${filePath}`,
						passed: false,
						message: `Cannot validate content - file not loaded: ${filePath}`,
						details: { filePath }
					});
				}
			}
		}
	}
	
	return results;
}

/**
 * Runs all tests for a level
 */
export async function validateLevel(
	tasks: TaskTest[],
	fileContents: Map<string, string>,
	existingFiles: string[]
): Promise<TestValidationResult> {
	const allResults: TestResult[] = [];
	
	for (const task of tasks) {
		const taskResults = await validateTask(task, fileContents, existingFiles);
		allResults.push(...taskResults);
	}
	
	const passed = allResults.filter(r => r.passed).length;
	const failed = allResults.filter(r => !r.passed).length;
	
	return {
		passed: failed === 0,
		results: allResults,
		summary: {
			total: allResults.length,
			passed,
			failed
		}
	};
}

/**
 * Validates all tasks are marked as completed
 */
export function validateTasksCompleted(
	tasks: Array<{ id: number; text: string; completed: boolean }>
): TestResult[] {
	return tasks.map(task => ({
		testId: `task-${task.id}`,
		testName: `Task completed: ${task.text}`,
		passed: task.completed,
		message: task.completed 
			? `✓ Task completed: ${task.text}` 
			: `✗ Task not completed: ${task.text}`,
		details: { taskId: task.id, text: task.text }
	}));
}
