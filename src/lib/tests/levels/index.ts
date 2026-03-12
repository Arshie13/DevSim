/**
 * Level Test Configurations
 * 
 * Exports all level test configurations.
 */

import LEVEL_1_CONFIG from './level1';
import LEVEL_2_CONFIG from './level2';
import LEVEL_3_CONFIG from './level3';
import LEVEL_4_CONFIG from './level4';
import LEVEL_5_CONFIG from './level5';
import type { LevelTestConfig } from '../types';

export const LEVEL_CONFIGS: Record<number, LevelTestConfig> = {
	1: LEVEL_1_CONFIG,
	2: LEVEL_2_CONFIG,
	3: LEVEL_3_CONFIG,
	4: LEVEL_4_CONFIG,
	5: LEVEL_5_CONFIG,
};

/**
 * Gets the test configuration for a specific level
 */
export function getLevelConfig(level: number): LevelTestConfig | undefined {
	return LEVEL_CONFIGS[level];
}

/**
 * Gets all available level configurations
 */
export function getAllLevelConfigs(): LevelTestConfig[] {
	return Object.values(LEVEL_CONFIGS);
}

/**
 * Checks if tests are defined for a given level
 */
export function hasTestsForLevel(level: number): boolean {
	return level in LEVEL_CONFIGS;
}

export { LEVEL_1_CONFIG, LEVEL_2_CONFIG, LEVEL_3_CONFIG, LEVEL_4_CONFIG, LEVEL_5_CONFIG };
