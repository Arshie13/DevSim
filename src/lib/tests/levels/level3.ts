/**
 * Level 3 Test Configuration
 * 
 * Tests for "Advanced Full-Stack" level
 * Focus: Real-time features, performance optimization, deployment
 */

import type { LevelTestConfig, TaskTest } from '../types';

// Task 1: WebSocket Setup
const task1Tests: TaskTest = {
	taskId: '1',
	taskText: 'Set up WebSocket server',
	requiredFiles: ['package.json'],
	requiredPatterns: [
		{ pattern: 'socket\\.io|ws|websocket', description: 'WebSocket dependency' },
		{ pattern: 'Server|http\\.createServer', description: 'Server setup' }
	]
};

// Task 2: Real-time Events
const task2Tests: TaskTest = {
	taskId: '2',
	taskText: 'Implement real-time events',
	requiredFiles: ['lib/socket.ts', 'lib/socket.js', 'app/api/socket/route.ts', 'src/utils/socket.ts', 'src/socket/index.ts'].filter(Boolean),
	requiredPatterns: [
		{ pattern: 'emit|on\\s*\\(', description: 'Socket emit/listen events' },
		{ pattern: 'connection|connect', description: 'Connection handling' }
	]
};

// Task 3: Performance Optimization
const task3Tests: TaskTest = {
	taskId: '3',
	taskText: 'Optimize performance',
	requiredFiles: ['next.config.js', 'next.config.mjs', 'vite.config.ts', 'webpack.config.js'],
	requiredPatterns: [
		{ pattern: 'images|Image|optimize', description: 'Image optimization' },
		{ pattern: 'compress|compression|gzip', description: 'Compression config' },
		{ pattern: 'bundle|analyze|minify', description: 'Bundle analysis or minification' }
	]
};

// Task 4: Caching Strategy
const task4Tests: TaskTest = {
	taskId: '4',
	taskText: 'Implement caching strategy',
	requiredFiles: [],
	requiredPatterns: [
		{ pattern: 'revalidate|ISR|fetch.*cache|cache.*strategy', description: 'Caching implementation' },
		{ pattern: 'unstable_cache|cacheTag|redis|memcached', description: 'Cache API or external cache' }
	]
};

export const LEVEL_3_CONFIG: LevelTestConfig = {
	level: 3,
	title: 'Advanced Full-Stack',
	tasks: [task1Tests, task2Tests, task3Tests, task4Tests]
};

export default LEVEL_3_CONFIG;
