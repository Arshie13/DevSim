/**
 * Level 5 Test Configuration
 * 
 * Tests for "Production Mastery" level
 * Focus: Advanced patterns, security, scaling
 */

import type { LevelTestConfig, TaskTest } from '../types';

// Task 1: Rate Limiting
const task1Tests: TaskTest = {
	taskId: '1',
	taskText: 'Implement rate limiting',
	requiredPatterns: [
		{ pattern: 'rateLimit|ratelimit|rate.limit', description: 'Rate limiting implementation' },
		{ pattern: 'ip|headers|client', description: 'IP or header detection' },
		{ pattern: '429|too.*many|rate.*limit', description: 'Rate limit response' }
	]
};

// Task 2: Input Validation
const task2Tests: TaskTest = {
	taskId: '2',
	taskText: 'Add input validation',
	requiredFiles: ['package.json'],
	requiredPatterns: [
		{ pattern: 'zod|joi|yup|validator|express-validator', description: 'Validation library' }
	]
};

// Task 3: Error Handling
const task3Tests: TaskTest = {
	taskId: '3',
	taskText: 'Implement error handling',
	requiredFiles: [],
	requiredPatterns: [
		{ pattern: 'error.*handler|ErrorBoundary|errorMiddleware', description: 'Error handler' },
		{ pattern: 'try.*catch|throw.*new|next\\(error\\)', description: 'Error handling patterns' }
	]
};

// Task 4: Security Headers
const task4Tests: TaskTest = {
	taskId: '4',
	taskText: 'Add security headers',
	requiredFiles: ['next.config.js', 'next.config.mjs', 'vite.config.ts', 'package.json'],
	requiredPatterns: [
		{ pattern: 'headers|security|CSP|helmet', description: 'Security headers config' },
		{ pattern: 'CSP|X-Frame|X-Content|frameguard|cors', description: 'Specific security headers' }
	]
};

// Task 5: Testing Setup
const task5Tests: TaskTest = {
	taskId: '5',
	taskText: 'Set up testing suite',
	requiredFiles: ['package.json'],
	requiredPatterns: [
		{ pattern: 'jest|vitest|playwright|cypress', description: 'Testing framework' }
	]
};

export const LEVEL_5_CONFIG: LevelTestConfig = {
	level: 5,
	title: 'Production Mastery',
	tasks: [task1Tests, task2Tests, task3Tests, task4Tests, task5Tests]
};

export default LEVEL_5_CONFIG;
