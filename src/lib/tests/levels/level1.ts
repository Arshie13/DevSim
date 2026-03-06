/**
 * Level 1 Test Configuration
 * 
 * Tests for "Setup & First API Route" level
 * Stack: Next.js + Prisma
 */

import type { LevelTestConfig, TaskTest } from '../types';

// Task 1: Set up Next.js 15 project with TypeScript
const task1Tests: TaskTest = {
	taskId: '1',
	taskText: 'Set up Next.js 15 project with TypeScript',
	requiredFiles: ['package.json', 'tsconfig.json'],
	requiredPatterns: [
		{ pattern: '"next":\\s*"', description: 'Next.js dependency' },
		{ pattern: '"typescript":\\s*"', description: 'TypeScript dependency' },
		{ pattern: '"@types/react":\\s*"', description: 'React types' }
	]
};

// Task 2: Configure Prisma with PostgreSQL
const task2Tests: TaskTest = {
	taskId: '2',
	taskText: 'Configure Prisma with PostgreSQL',
	requiredFiles: ['prisma/schema.prisma', 'package.json'],
	requiredPatterns: [
		{ pattern: 'datasource\\s+db', description: 'Prisma datasource configuration' },
		{ pattern: 'provider\\s*=\\s*["\']postgresql["\']', description: 'PostgreSQL provider' },
		{ pattern: 'generator\\s+client', description: 'Prisma client generator' },
		{ pattern: '@prisma/client', description: 'Prisma client import' }
	]
};

// Task 3: Create a simple User model
const task3Tests: TaskTest = {
	taskId: '3',
	taskText: 'Create a simple User model',
	requiredFiles: ['prisma/schema.prisma'],
	requiredPatterns: [
		{ pattern: 'model\\s+User', description: 'User model definition' },
		{ pattern: '@id', description: 'User model has ID field' },
		{ pattern: '@default\\(uuid\\(\\)\\)', description: 'UUID default value' }
	]
};

// Task 4: Build GET /api/users endpoint
const task4Tests: TaskTest = {
	taskId: '4',
	taskText: 'Build GET /api/users endpoint',
	requiredFiles: ['app/api/users/route.ts', 'app/api/users/+server.ts'].filter(Boolean),
	requiredPatterns: [
		{ pattern: 'export\\s+function\\s+GET', description: 'GET handler export' },
		{ pattern: 'prisma\\.user', description: 'Prisma user query' },
		{ pattern: 'return\\s+Response\\.json|return\\s+json', description: 'JSON response' }
	]
};

export const LEVEL_1_CONFIG: LevelTestConfig = {
	level: 1,
	title: 'Setup & First API Route',
	tasks: [task1Tests, task2Tests, task3Tests, task4Tests]
};

export default LEVEL_1_CONFIG;
