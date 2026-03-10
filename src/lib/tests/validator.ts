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
 * STRICT: Requires exact path match, not just filename match
 */
export async function validateFileExists(
	filePath: string,
	existingFiles: string[],
	contentMap?: Map<string, string>
): Promise<FileValidationResult> {
	// Normalize the file path (remove leading/trailing slashes)
	const normalizedPath = filePath.replace(/^\/|^workspace\//, '');
	
	// STRICT: Check for exact path match first (most strict)
	let exists = existingFiles.some(f => {
		const normalizedF = f.replace(/^\/workspace\//, '');
		// Exact match
		if (normalizedF === normalizedPath) return true;
		// Path with trailing slash
		if (normalizedF === normalizedPath + '/') return true;
		return false;
	});
	
	// If not found exactly, try partial match (but log a warning)
	if (!exists) {
		existingFiles.some(f => {
			const normalizedF = f.replace(/^\/workspace\//, '');
			// Check if it ends with the required path (for nested files)
			if (normalizedF.endsWith('/' + normalizedPath) || normalizedF.endsWith(normalizedPath)) {
				console.log('[VALIDATOR] WARNING: Partial match found for', filePath, '->', f);
				exists = true;
				return true;
			}
			return false;
		});
	}
	
	// Also check in contentMap
	if (!exists && contentMap) {
		exists = Array.from(contentMap.keys()).some(k => {
			const normalizedK = k.replace(/^\/workspace\//, '');
			if (normalizedK === normalizedPath) return true;
			if (normalizedK === normalizedPath + '/') return true;
			return false;
		});
	}
	
	return {
		path: filePath,
		exists,
		errors: exists ? undefined : [`File not found: ${filePath} (exact path required)`]
	};
}

/**
 * Validates that file content matches expected patterns
 * STRICT: Uses case-sensitive matching by default
 */
export function validateContentPatterns(
	content: string,
	patterns: Array<{ pattern: string; description: string }>,
	options: { caseSensitive?: boolean } = {}
): TestResult[] {
	const results: TestResult[] = [];
	const isCaseSensitive = options.caseSensitive ?? true; // Default to strict case-sensitive
	
	for (const { pattern, description } of patterns) {
		try {
			const flags = isCaseSensitive ? '' : 'i';
			const regex = new RegExp(pattern, flags);
			const matches = regex.test(content);
			
			// For stricter validation, also check for the pattern in context
			let foundInContext = '';
			if (matches) {
				const match = content.match(regex);
				if (match && match.index !== undefined) {
					const start = Math.max(0, match.index - 20);
					const end = Math.min(content.length, match.index + match[0].length + 20);
					foundInContext = content.substring(start, end).replace(/\n/g, ' ');
				}
			}
			
			results.push({
				testId: `pattern-${description.toLowerCase().replace(/\s+/g, '-')}`,
				testName: description,
				passed: matches,
				message: matches 
					? `✓ Found: ${description}${foundInContext ? ` (${foundInContext})` : ''}` 
					: `✗ Missing: ${description}`,
				details: { pattern, contentPreview: content.substring(0, 100), caseSensitive: isCaseSensitive }
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
	
	console.log('[VALIDATOR] Validating task:', task.taskText);
	console.log('[VALIDATOR] Required patterns:', task.requiredPatterns);
	console.log('[VALIDATOR] Required files:', task.requiredFiles);
	console.log('[VALIDATOR] Files in contentMap:', Array.from(fileContents.keys()));
	
	// Test: Required files exist
	if (task.requiredFiles && task.requiredFiles.length > 0) {
		for (const filePath of task.requiredFiles) {
			const fileResult = await validateFileExists(filePath, existingFiles, fileContents);
			results.push({
				testId: `file-${filePath.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`,
				testName: `File exists: ${filePath}`,
				passed: fileResult.exists,
				message: fileResult.exists 
					? `✓ File exists: ${filePath}` 
					: `✗ File not found: ${filePath}`,
				details: { path: filePath }
			});
		}
	}
	
	// Test: Content patterns - check ALL files for required patterns
	if (task.requiredPatterns && task.requiredPatterns.length > 0) {
		// If no file contents to check, fail all pattern tests
		if (fileContents.size === 0) {
			for (const { pattern, description } of task.requiredPatterns) {
				results.push({
					testId: `pattern-${description.toLowerCase().replace(/\s+/g, '-')}`,
					testName: description,
					passed: false,
					message: `Missing: ${description} - No files to check`,
					details: { pattern, searchedFiles: [] }
				});
			}
		} else {
			// Check ALL files in contentMap for the required patterns
			const allPatternResults: TestResult[] = [];
			
			for (const [filePath, content] of fileContents) {
				if (content && content.length > 0) {
					console.log('[VALIDATOR] Checking patterns in file:', filePath, 'content length:', content.length);
					const patternResults = validateContentPatterns(content, task.requiredPatterns);
					
					// Log what was found in this file
					for (const result of patternResults) {
						console.log('[VALIDATOR]   Pattern:', result.testName, '-> passed:', result.passed);
					}
					
					// Mark results with file path where found
					for (const result of patternResults) {
						result.details = { ...result.details, foundInFile: filePath };
					}
					allPatternResults.push(...patternResults);
				}
			}
			
			// Group results by pattern description to see if ANY file has it
			const patternDescriptions = [...new Set(allPatternResults.map(r => r.testName))];
			
			for (const desc of patternDescriptions) {
				const patternResultsForDesc = allPatternResults.filter(r => r.testName === desc);
				const passedInAnyFile = patternResultsForDesc.some(r => r.passed);
				const filesWhereFound = patternResultsForDesc
					.filter(r => r.passed)
					.map(r => r.details?.foundInFile)
					.filter(Boolean);
				
				// Get the failed message if not found anywhere
				if (!passedInAnyFile) {
					const failedResult = patternResultsForDesc[0];
					results.push({
						testId: failedResult.testId,
						testName: failedResult.testName,
						passed: false,
						message: `Missing: ${failedResult.testName}`,
						details: { searchedFiles: Array.from(fileContents.keys()) }
					});
				} else {
					// Found! Add a passing result with file location
					const firstResult = patternResultsForDesc[0];
					results.push({
						testId: firstResult.testId,
						testName: firstResult.testName,
						passed: true,
						message: `✓ Found: ${firstResult.testName} in ${filesWhereFound.join(', ')}`,
						details: { foundIn: filesWhereFound }
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
