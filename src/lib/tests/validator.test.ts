/**
 * Unit Tests for Level Test Validator
 * 
 * Tests the validation logic for level submissions
 */

import { 
	validateFileExists, 
	validateContentPatterns, 
	validateTasksCompleted,
	validateTask 
} from './validator';

describe('validateFileExists', () => {
	const existingFiles = [
		'/workspace/package.json',
		'/workspace/prisma/schema.prisma',
		'/workspace/app/page.tsx',
		'/workspace/app/api/users/route.ts'
	];

	it('should find existing file with full path', async () => {
		const result = await validateFileExists('/workspace/package.json', existingFiles);
		expect(result.exists).toBe(true);
		expect(result.errors).toBeUndefined();
	});

	it('should find existing file without workspace prefix', async () => {
		const result = await validateFileExists('package.json', existingFiles);
		expect(result.exists).toBe(true);
	});

	it('should return error for missing file', async () => {
		const result = await validateFileExists('/workspace/missing.ts', existingFiles);
		expect(result.exists).toBe(false);
		expect(result.errors).toBeDefined();
		expect(result.errors?.[0]).toContain('not found');
	});

	it('should handle partial path matches', async () => {
		const result = await validateFileExists('app/api/users/route.ts', existingFiles);
		expect(result.exists).toBe(true);
	});
});

describe('validateContentPatterns', () => {
	it('should find matching patterns in content', () => {
		const content = `
			import { PrismaClient } from '@prisma/client';
			
			const prisma = new PrismaClient();
			
			export async function GET() {
				return Response.json({ users: [] });
			}
		`;
		
		const patterns = [
			{ pattern: 'PrismaClient', description: 'Prisma client import' },
			{ pattern: 'export.*GET', description: 'GET handler export' },
			{ pattern: 'Response\\.json', description: 'JSON response' }
		];
		
		const results = validateContentPatterns(content, patterns);
		
		expect(results.length).toBe(3);
		expect(results.every(r => r.passed)).toBe(true);
	});

	it('should fail for missing patterns', () => {
		const content = 'const x = 1;';
		
		const patterns = [
			{ pattern: 'prisma', description: 'Prisma client' },
			{ pattern: 'database', description: 'Database connection' }
		];
		
		const results = validateContentPatterns(content, patterns);
		
		expect(results.length).toBe(2);
		expect(results.filter(r => r.passed).length).toBe(0);
	});

	it('should handle invalid regex patterns gracefully', () => {
		const content = 'test content';
		
		const patterns = [
			{ pattern: '[invalid(', description: 'Invalid regex' }
		];
		
		const results = validateContentPatterns(content, patterns);
		
		expect(results.length).toBe(1);
		expect(results[0].passed).toBe(false);
		expect(results[0].message).toContain('Invalid pattern');
	});
});

describe('validateTasksCompleted', () => {
	it('should mark completed tasks as passed', () => {
		const tasks = [
			{ id: 1, text: 'Task 1', completed: true },
			{ id: 2, text: 'Task 2', completed: true },
			{ id: 3, text: 'Task 3', completed: true }
		];
		
		const results = validateTasksCompleted(tasks);
		
		expect(results.length).toBe(3);
		expect(results.every(r => r.passed)).toBe(true);
	});

	it('should mark incomplete tasks as failed', () => {
		const tasks = [
			{ id: 1, text: 'Task 1', completed: true },
			{ id: 2, text: 'Task 2', completed: false },
			{ id: 3, text: 'Task 3', completed: true }
		];
		
		const results = validateTasksCompleted(tasks);
		
		expect(results.length).toBe(3);
		expect(results.filter(r => r.passed).length).toBe(2);
		expect(results.filter(r => !r.passed).length).toBe(1);
		expect(results[1].testName).toContain('Task 2');
	});

	it('should return correct test IDs', () => {
		const tasks = [
			{ id: 1, text: 'First task', completed: true }
		];
		
		const results = validateTasksCompleted(tasks);
		
		expect(results[0].testId).toBe('task-1');
	});
});

describe('validateTask', () => {
	it('should validate task with required files', async () => {
		const task = {
			taskId: '1',
			taskText: 'Create package.json',
			requiredFiles: ['package.json'],
			requiredPatterns: [
				{ pattern: 'name', description: 'Package name' }
			]
		};
		
		const fileContents = new Map<string, string>([
			['package.json', '{"name": "test-project"}']
		]);
		const existingFiles = ['/workspace/package.json'];
		
		const results = await validateTask(task, fileContents, existingFiles);
		
		// Should have file exists check and pattern check
		expect(results.length).toBeGreaterThan(0);
	});

	it('should handle missing file contents gracefully', async () => {
		const task = {
			taskId: '1',
			taskText: 'Create file',
			requiredFiles: ['missing.json'],
			requiredPatterns: [
				{ pattern: 'test', description: 'Test pattern' }
			]
		};
		
		const fileContents = new Map<string, string>();
		const existingFiles = ['/workspace/package.json'];
		
		const results = await validateTask(task, fileContents, existingFiles);
		
		// Should fail file check and content check
		const failedResults = results.filter(r => !r.passed);
		expect(failedResults.length).toBeGreaterThan(0);
	});
});
