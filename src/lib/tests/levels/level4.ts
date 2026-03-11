/**
 * Level 4 Test Configuration
 * 
 * Tests for "Expert DevOps" level
 * Focus: Containerization, orchestration, infrastructure as code
 */

import type { LevelTestConfig, TaskTest } from '../types';

// Task 1: Docker Setup
const task1Tests: TaskTest = {
	taskId: '1',
	taskText: 'Create Dockerfile',
	requiredFiles: ['Dockerfile'],
	requiredPatterns: [
		{ pattern: 'FROM', description: 'Base image specified' },
		{ pattern: 'WORKDIR|RUN|COPY|ENTRYPOINT', description: 'Docker commands used' },
		{ pattern: 'EXPOSE|port', description: 'Port exposed' }
	]
};

// Task 2: Docker Compose
const task2Tests: TaskTest = {
	taskId: '2',
	taskText: 'Set up Docker Compose',
	requiredFiles: ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'],
	requiredPatterns: [
		{ pattern: 'services:|version:', description: 'Services or version defined' },
		{ pattern: 'image:|build:', description: 'Image or build context' },
		{ pattern: 'ports:|volumes:|environment', description: 'Ports, volumes, or environment mapped' }
	]
};

// Task 3: CI/CD Pipeline
const task3Tests: TaskTest = {
	taskId: '3',
	taskText: 'Create CI/CD pipeline',
	requiredFiles: ['.github/workflows/*.yml', '.github/workflows/*.yaml', 'gitlab-ci.yml'],
	requiredPatterns: [
		{ pattern: 'on:|trigger:', description: 'Pipeline triggers' },
		{ pattern: 'jobs:|stages:', description: 'Jobs or stages defined' },
		{ pattern: 'run:|script:', description: 'Run commands' }
	]
};

// Task 4: Environment Configuration
const task4Tests: TaskTest = {
	taskId: '4',
	taskText: 'Configure environment variables',
	requiredFiles: ['.env.example', '.env.production', 'docker-compose.yml'],
	requiredPatterns: [
		{ pattern: 'NODE_ENV|DATABASE_URL', description: 'Environment variables' },
		{ pattern: 'SECRET|KEY|TOKEN', description: 'Secret configurations' }
	]
};

export const LEVEL_4_CONFIG: LevelTestConfig = {
	level: 4,
	title: 'Expert DevOps',
	tasks: [task1Tests, task2Tests, task3Tests, task4Tests]
};

export default LEVEL_4_CONFIG;
