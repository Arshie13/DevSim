/**
 * POST /api/tests/run
 * 
 * Runs tests for a level submission to validate user work.
 * This endpoint is called when the user submits their sprint.
 * 
 * Body: {
 *   containerId: string,
 *   level: number,
 *   tasks: Array<{ id: number; text: string; completed: boolean }>,
 *   fileContents: Record<string, string>,
 *   existingFiles: string[]
 * }
 * 
 * Returns: {
 *   success: boolean,
 *   passed: boolean,
 *   results: TestValidationResult,
 *   failedTasks: Array<{ taskId, taskText, errors }>,
 *   message: string
 * }
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { runLevelTests } from '$lib/tests/runner';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Auth check
	const session = await locals.auth();
	if (!session?.user?.id) {
		return error(401, 'Unauthorized');
	}

	try {
		const body = await request.json();
		const { level, tasks, fileContents, existingFiles } = body;

		if (!level || !tasks) {
			return error(400, 'Missing required fields: level, tasks');
		}

		console.log('[TEST RUNNER] Received fileContents:', fileContents ? Object.keys(fileContents).length : 0, 'files');
		console.log('[TEST RUNNER] Files:', fileContents ? Object.keys(fileContents) : []);

		// Run the tests
		const result = await runLevelTests({
			level,
			tasks,
			fileContents: fileContents || {},
			existingFiles: existingFiles || []
		});

		// Detailed test results logging
		console.log('[TEST RUNNER] === Test Results Summary ===');
		console.log('[TEST RUNNER] Success:', result.success);
		console.log('[TEST RUNNER] Overall Passed:', result.overallResult.passed);
		console.log('[TEST RUNNER] Total Tests:', result.overallResult.summary.total);
		console.log('[TEST RUNNER] Passed Tests:', result.overallResult.summary.passed);
		console.log('[TEST RUNNER] Failed Tests:', result.overallResult.summary.failed);
		
		if (result.failedTasks.length > 0) {
			console.log('[TEST RUNNER] === Failed Tasks ===');
			result.failedTasks.forEach((task, index) => {
				console.log(`[TEST RUNNER] ${index + 1}. ${task.taskText}`);
				task.errors.forEach(error => {
					console.log(`[TEST RUNNER]   • ${error}`);
				});
			});
		}
		
		console.log('[TEST RUNNER] === Detailed Test Results ===');
		result.overallResult.results.forEach(result => {
			console.log(`[TEST RUNNER] ${result.passed ? '✅' : '❌'} ${result.testName}: ${result.message}`);
		});

		return json({
			success: result.success,
			passed: result.overallResult.passed,
			results: result.overallResult,
			failedTasks: result.failedTasks,
			message: result.success 
				? 'All tests passed! Your work has been validated.'
				: `Tests failed. ${result.failedTasks.length} task(s) need attention.`
		});
	} catch (err) {
		console.error('Test runner error:', err);
		return error(500, `Test execution failed: ${String(err)}`);
	}
};
