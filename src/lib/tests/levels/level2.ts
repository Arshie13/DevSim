/**
 * Level 2 Test Configuration
 * 
 * Tests for "Intermediate Development" level
 * Focus: Authentication, forms, RESTful APIs
 */

import type { LevelTestConfig, TaskTest } from '../types';

// Task 1: Authentication Setup
const task1Tests: TaskTest = {
	taskId: '1',
	taskText: 'Set up authentication system',
	requiredFiles: ['package.json', 'app/api/auth/[...nextauth]/route.ts', 'app/api/auth/[...nextauth]/+server.ts'].filter(Boolean),
	requiredPatterns: [
		{ pattern: 'next-auth|authjs', description: 'NextAuth.js or Auth.js dependency' },
		{ pattern: 'GET|POST', description: 'Auth handler methods' },
		{ pattern: 'export.*handler', description: 'Auth handler export' }
	]
};

// Task 2: User Registration API
const task2Tests: TaskTest = {
	taskId: '2',
	taskText: 'Create user registration endpoint',
	requiredFiles: ['app/api/register/route.ts', 'app/api/register/+server.ts'].filter(Boolean),
	requiredPatterns: [
		{ pattern: 'POST', description: 'POST method for registration' },
		{ pattern: 'prisma.*create|db.*create', description: 'Database create operation' },
		{ pattern: 'email|password', description: 'Email/password fields' }
	]
};

// Task 3: Login API
const task3Tests: TaskTest = {
	taskId: '3',
	taskText: 'Create login endpoint',
	requiredFiles: ['app/api/login/route.ts', 'app/api/login/+server.ts'].filter(Boolean),
	requiredPatterns: [
		{ pattern: 'POST', description: 'POST method for login' },
		{ pattern: 'signIn|compare', description: 'Sign in or password comparison' },
		{ pattern: 'jwt|JWT|token', description: 'JWT token handling' }
	]
};

// Task 4: Protected Route
const task4Tests: TaskTest = {
	taskId: '4',
	taskText: 'Implement protected route',
	requiredFiles: ['middleware.ts', 'app/api/protected/route.ts', 'app/api/protected/+server.ts'].filter(Boolean),
	requiredPatterns: [
		{ pattern: 'middleware', description: 'Middleware configuration' },
		{ pattern: 'session|token', description: 'Session/token verification' },
		{ pattern: 'unauthorized|401|redirect', description: 'Unauthorized handling' }
	]
};

export const LEVEL_2_CONFIG: LevelTestConfig = {
	level: 2,
	title: 'Intermediate Development',
	tasks: [task1Tests, task2Tests, task3Tests, task4Tests]
};

export default LEVEL_2_CONFIG;
