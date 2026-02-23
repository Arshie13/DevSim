#!/usr/bin/env node
/**
 * Script to create Docker volumes for all tech stack scenarios in submodules/
 * 
 * This script:
 * 1. Scans submodules/projects/tech-stacks for tech stacks
 * 2. Finds all scenarios within each tech stack
 * 3. Creates Docker volumes named: DEVSIM_{tech-stack}_{scenario}
 * 4. Copies project files into each volume (excluding node_modules, .git, etc.)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const SUBMODULES_DIR = path.join(ROOT_DIR, 'submodules', 'projects', 'tech-stacks');
const CONTAINER_MOUNT_PATH = '/workspace';

// Directories/files to exclude from volumes
const EXCLUDES = [
  'node_modules',
  '.next',
  '.git',
  '.turbo',
  'dist',
  'build',
  'coverage',
  '.DS_Store',
  'npm-debug.log',
  'yarn-error.log',
  'yarn-debug.log',
  '.pnpm-debug.log',
  '.env',
  '.env.local',
  '.env.*.local',
  '*.log',
  '.vercel',
  '.output',
  'tsconfig.tsbuildinfo',
  '.eslintcache',
  '.cache',
  '__pycache__',
  '.pytest_cache',
  'venv',
  '.venv'
];

interface Scenario {
  techStack: string;
  scenarioNumber: number;
  projectPath: string;
  projectName: string;
}

/**
 * Get all scenarios from the tech-stacks directory
 */
function getAllScenarios(): Scenario[] {
  const scenarios: Scenario[] = [];
  
  if (!fs.existsSync(SUBMODULES_DIR)) {
    console.error(`Error: Directory not found: ${SUBMODULES_DIR}`);
    return scenarios;
  }

  const techStacks = fs.readdirSync(SUBMODULES_DIR);
  
  for (const techStack of techStacks) {
    const techStackPath = path.join(SUBMODULES_DIR, techStack);
    const stat = fs.statSync(techStackPath);
    
    if (!stat.isDirectory()) continue;
    
    // Look for scenario directories
    const scenarioDirs = fs.readdirSync(techStackPath).filter(name => name.startsWith('scenario-'));
    
    for (const scenarioDir of scenarioDirs) {
      const scenarioPath = path.join(techStackPath, scenarioDir);
      const scenarioStat = fs.statSync(scenarioPath);
      
      if (!scenarioStat.isDirectory()) continue;
      
      // Extract scenario number
      const scenarioNumber = parseInt(scenarioDir.replace('scenario-', ''), 10);
      
      // Find the project folder (not project.md or levels.md)
      const scenarioContents = fs.readdirSync(scenarioPath);
      const projectName = scenarioContents.find(name => {
        const itemPath = path.join(scenarioPath, name);
        const itemStat = fs.statSync(itemPath);
        // Skip markdown files and hidden directories
        return itemStat.isDirectory() && !name.startsWith('.');
      });
      
      if (projectName) {
        scenarios.push({
          techStack,
          scenarioNumber,
          projectPath: path.join(scenarioPath, projectName),
          projectName
        });
      }
    }
  }
  
  return scenarios;
}

/**
 * Generate volume name for a scenario
 */
function getVolumeName(techStack: string, scenarioNumber: number): string {
  return `DEVSIM_${techStack}_scenario-${scenarioNumber}`;
}

/**
 * Check if a volume exists
 */
function volumeExists(volumeName: string): boolean {
  try {
    execSync(`docker volume inspect ${volumeName}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a Docker volume
 */
function createVolume(volumeName: string): void {
  if (!volumeExists(volumeName)) {
    console.log(`Creating volume: ${volumeName}`);
    execSync(`docker volume create ${volumeName}`, { stdio: 'inherit' });
  } else {
    console.log(`Volume already exists: ${volumeName}`);
  }
}

/**
 * Build rsync exclude arguments
 */
function buildRsyncExcludes(): string {
  return EXCLUDES.map(item => `--exclude=${item}`).join(' ');
}

/**
 * Copy files into a volume using a temporary container
 */
function copyFilesToVolume(volumeName: string, sourcePath: string): void {
  console.log(`  Copying files from: ${sourcePath}`);
  
  const excludes = buildRsyncExcludes();
  
  // Get absolute path for source
  const absoluteSourcePath = path.resolve(sourcePath);
  
  const command = `
    docker run --rm \
      -v "${volumeName}:${CONTAINER_MOUNT_PATH}" \
      -v "${absoluteSourcePath}:/source:ro" \
      alpine \
      sh -c "
        apk add --no-cache rsync >/dev/null 2>&1 && \
        rsync -a ${excludes} /source/ ${CONTAINER_MOUNT_PATH}/
      "
  `;
  
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`  Successfully copied files to volume: ${volumeName}`);
  } catch (error) {
    console.error(`  Error copying files to volume: ${volumeName}`, error);
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('=== DevSim Volume Creator ===\n');
  console.log(`Scanning: ${SUBMODULES_DIR}\n`);
  
  const scenarios = getAllScenarios();
  
  if (scenarios.length === 0) {
    console.log('No scenarios found.');
    return;
  }
  
  console.log(`Found ${scenarios.length} scenarios:\n`);
  
  for (const scenario of scenarios) {
    const volumeName = getVolumeName(scenario.techStack, scenario.scenarioNumber);
    console.log(`Processing: ${scenario.techStack} / scenario-${scenario.scenarioNumber}`);
    console.log(`  Project: ${scenario.projectName}`);
    console.log(`  Volume: ${volumeName}`);
    
    createVolume(volumeName);
    copyFilesToVolume(volumeName, scenario.projectPath);
    console.log('');
  }
  
  console.log('=== Done! ===\n');
  
  // List all created volumes
  console.log('Created volumes:');
  const allVolumes = scenarios.map(s => getVolumeName(s.techStack, s.scenarioNumber));
  for (const vol of allVolumes) {
    console.log(`  - ${vol}`);
  }
}

main().catch(console.error);
