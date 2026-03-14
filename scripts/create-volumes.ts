#!/usr/bin/env tsx

/**
 * Script to create Docker volumes with project files from submodules/projects/tech-stacks/
 * 
 * Usage:
 *   npx tsx scripts/create-volumes.ts
 * 
 * Options:
 *   --dry-run    Show what would be created without actually creating volumes
 *   --force      Recreate volumes if they already exist
 *   --stack NAME Only create volume for specific stack (e.g., --stack nestjs-postgres-prisma)
 */

import { docker } from "../src/lib/server/docker/client";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Args {
  dryRun?: boolean;
  force?: boolean;
  stack?: string;
}

interface TechStack {
  name: string;
  projects: string[];
}

// Directories to exclude when copying
const EXCLUDES = [
  "node_modules",
  ".next",
  ".git",
  ".turbo",
  "dist",
  "build",
  "coverage",
  ".DS_Store",
  "npm-debug.log",
  "yarn-error.log",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".env",
  ".env.local",
  ".env.*.local",
  "__pycache__",
  "*.pyc",
  ".pytest_cache",
  "venv",
  ".venv",
];

// Base path to the tech-stacks directory
const TECH_STACKS_BASE_PATH = path.join(__dirname, "..", "submodules", "projects", "tech-stacks");

function parseArgs(): Args {
  const args: Args = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") args.dryRun = true;
    if (arg === "--force") args.force = true;
    if (arg === "--stack" && argv[i + 1]) {
      args.stack = argv[i + 1];
      i++;
    }
  }

  return args;
}

function getTechStacks(): TechStack[] {
  const stacks: TechStack[] = [];

  if (!fs.existsSync(TECH_STACKS_BASE_PATH)) {
    console.error(`Tech stacks directory not found: ${TECH_STACKS_BASE_PATH}`);
    return stacks;
  }

  const stackDirs = fs.readdirSync(TECH_STACKS_BASE_PATH);
  
  for (const stackDir of stackDirs) {
    const stackPath = path.join(TECH_STACKS_BASE_PATH, stackDir);
    const stat = fs.statSync(stackPath);
    
    if (stat.isDirectory()) {
      const projects = fs.readdirSync(stackPath).filter(projectName => {
        const projectPath = path.join(stackPath, projectName);
        return fs.statSync(projectPath).isDirectory();
      });
      
      stacks.push({
        name: stackDir,
        projects,
      });
    }
  }

  return stacks;
}

function normalizeStackName(stackName: string): string {
  // Convert to lowercase, replace underscores/hyphens with hyphens
  return stackName.toLowerCase().replace(/[_ ]+/g, "-");
}

function getVolumeName(stackName: string, projectName: string): string {
  const normalizedStack = normalizeStackName(stackName);
  const normalizedProject = projectName.toLowerCase().replace(/[_ ]+/g, "-");
  return `${normalizedStack}-${normalizedProject}`;
}

async function volumeExists(volumeName: string): Promise<boolean> {
  try {
    await docker.getVolume(volumeName).inspect();
    return true;
  } catch {
    return false;
  }
}

async function createVolumeWithFiles(
  stackName: string,
  projectName: string,
  force: boolean
): Promise<boolean> {
  const volumeName = getVolumeName(stackName, projectName);
  const projectPath = path.join(TECH_STACKS_BASE_PATH, stackName, projectName);

  console.log(`\n--- ${stackName}/${projectName} ---`);
  console.log(`  Volume: ${volumeName}`);
  console.log(`  Source: ${projectPath}`);

  // Check if volume already exists
  const exists = await volumeExists(volumeName);
  if (exists) {
    if (!force) {
      console.log("  Status: Already exists (skipping)");
      return true;
    }
    console.log("  Status: Recreating...");
    try {
      await docker.getVolume(volumeName).remove();
    } catch (err) {
      console.error(`  Error removing volume: ${err}`);
      return false;
    }
  }

  // Create volume
  try {
    await docker.createVolume({ Name: volumeName });
    console.log("  ✓ Volume created");
  } catch (err) {
    console.error(`  ✗ Failed to create volume: ${err}`);
    return false;
  }

  // Build rsync exclude arguments
  const excludeArgs = EXCLUDES.map(exclude => `--exclude=${exclude}`).join(" ");

  // Copy files into volume using alpine container with rsync
  try {
    // Use docker run command directly
    const dockerCmd = `docker run --rm \
      -v "${volumeName}:/data" \
      -v "${projectPath}:/source:ro" \
      alpine \
      sh -c "apk add --no-cache rsync >/dev/null 2>&1 && rsync -a ${excludeArgs} /source/ /data/"`;
    
    await execAsync(dockerCmd);
    console.log("  ✓ Files copied to volume");
  } catch (err) {
    console.error(`  ✗ Failed to copy files: ${err}`);
    // Clean up the volume on failure
    try {
      await docker.getVolume(volumeName).remove();
    } catch {}
    return false;
  }

  return true;
}

async function main() {
  const args = parseArgs();

  console.log("\n=== DevSim Volume Creator ===\n");

  const techStacks = getTechStacks();

  if (techStacks.length === 0) {
    console.log("No tech stacks found.");
    return;
  }

  // Filter by stack if specified
  const filteredStacks = args.stack
    ? techStacks.filter(s => s.name === args.stack)
    : techStacks;

  if (filteredStacks.length === 0) {
    if (args.stack) {
      console.log(`Stack '${args.stack}' not found.`);
      console.log(`Available stacks: ${techStacks.map(s => s.name).join(", ")}`);
    }
    return;
  }

  // Show summary
  console.log(`Found ${filteredStacks.length} tech stack(s):\n`);
  
  let totalProjects = 0;
  for (const stack of filteredStacks) {
    console.log(`  ${stack.name} (${stack.projects.length} project(s))`);
    for (const project of stack.projects) {
      const volumeName = getVolumeName(stack.name, project);
      console.log(`    - ${project} → ${volumeName}`);
      totalProjects++;
    }
  }

  console.log(`\nTotal: ${totalProjects} volume(s) to create`);

  if (args.dryRun) {
    console.log("\n--dry-run flag provided, exiting after listing volumes");
    return;
  }

  // Create volumes
  console.log("\n=== Creating Volumes ===\n");

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const stack of filteredStacks) {
    for (const project of stack.projects) {
      const volumeName = getVolumeName(stack.name, project);
      
      // Check if already exists (unless force)
      if (!args.force) {
        const exists = await volumeExists(volumeName);
        if (exists) {
          console.log(`\n--- ${stack.name}/${project} ---`);
          console.log(`  Status: Already exists (skipping)`);
          skipped++;
          continue;
        }
      }

      const result = await createVolumeWithFiles(stack.name, project, !!args.force);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }
  }

  console.log("\n=== Results ===");
  console.log(`Created: ${success} | Skipped: ${skipped} | Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
