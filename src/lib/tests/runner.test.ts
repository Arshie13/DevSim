/**
 * Unit Tests for Test Runner
 * 
 * Tests the runLevelTests function and related utilities
 */

import { runLevelTests, getTestsForLevel, getAllTests } from './runner';

describe('runLevelTests', () => {
	// Test when no level config exists
	it('should allow submission when no tests are defined for level', async () => {
		const result = await runLevelTests({
			level: 999, // Non-existent level
			tasks: [
				{ id: 1, text: 'Some task', completed: true }
			],
			fileContents: {},
			existingFiles: []
		});

		expect(result.success).toBe(true);
		expect(result.overallResult.passed).toBe(true);
	});

	// Test when tasks are not completed
	it('should fail when tasks are not completed', async () => {
		const result = await runLevelTests({
			level: 1,
			tasks: [
				{ id: 1, text: 'Set up Next.js project', completed: false },
				{ id: 2, text: 'Configure Prisma', completed: false }
			],
			fileContents: {},
			existingFiles: []
		});

		expect(result.success).toBe(false);
		expect(result.overallResult.passed).toBe(false);
		expect(result.failedTasks.length).toBe(2);
	});

	// Test with completed tasks but no files
	it('should fail when required files are missing', async () => {
		const result = await runLevelTests({
			level: 1,
			tasks: [
				{ id: 1, text: 'Set up Next.js 15 project with TypeScript', completed: true }
			],
			fileContents: {},
			existingFiles: [] // No files
		});

		// Should fail because files don't exist
		// Note: The first check is if tasks are completed (they are)
		// Then it tries to validate the files
		expect(result.success).toBe(false);
	});
});

describe('getTestsForLevel', () => {
	it('should return config for existing level', () => {
		const config = getTestsForLevel(1);
		
		expect(config).toBeDefined();
		expect(config?.level).toBe(1);
		expect(config?.tasks.length).toBeGreaterThan(0);
	});

	it('should return undefined for non-existent level', () => {
		const config = getTestsForLevel(999);
		
		expect(config).toBeUndefined();
	});
});

describe('getAllTests', () => {
	it('should return all level configurations', () => {
		const allTests = getAllTests();
		
		expect(Array.isArray(allTests)).toBe(true);
		expect(allTests.length).toBeGreaterThan(0);
	});
});
