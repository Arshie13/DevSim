/**
 * Test Types for DevSim Level Testing System
 * 
 * This module defines the types used for level validation tests.
 */

export interface TestCase {
	id: string;
	name: string;
	description: string;
}

export interface TestResult {
	testId: string;
	testName: string;
	passed: boolean;
	message: string;
	details?: Record<string, any>;
}

export interface LevelTest {
	level: number;
	title: string;
	tests: TestCase[];
}

export interface TestValidationResult {
	passed: boolean;
	results: TestResult[];
	summary: {
		total: number;
		passed: number;
		failed: number;
	};
}

/**
 * File validation result
 */
export interface FileValidationResult {
	path: string;
	exists: boolean;
	content?: string;
	errors?: string[];
}

/**
 * Task test type
 */
export interface TaskTest {
	taskId: string;
	taskText: string;
	requiredFiles?: string[];
	requiredPatterns?: Array<{
		pattern: string;
		description: string;
	}>;
	commandTests?: Array<{
		command: string;
		expectedOutput?: string;
		description: string;
	}>;
}

/**
 * Level test configuration
 */
export interface LevelTestConfig {
	level: number;
	title: string;
	tasks: TaskTest[];
}
