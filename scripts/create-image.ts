#!/usr/bin/env tsx

/**
 * Script to build custom Docker images for each project in submodules/projects/tech-stacks/
 * 
 * Each image will include:
 * - Postgres Alpine (for database)
 * - Node Alpine (for application runtime)
 * - Project-specific configurations
 * 
 * Usage:
 *   npx tsx scripts/create-image.ts
 * 
 * Options:
 *   --dry-run    Show what would be created without actually building images
 *   --force      Rebuild images even if they already exist
 *   --stack NAME Only build image for specific stack (e.g., --stack nestjs-postgres-prisma)
 *   --tag TAG    Custom tag prefix for images (default: devsim-project)
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Args {
  dryRun?: boolean;
  force?: boolean;
  stack?: string;
  tag?: string;
}

interface TechStack {
  name: string;
  scenarios: string[];
  projects: string[];
}

// Base path to the tech-stacks directory
const TECH_STACKS_BASE_PATH = path.join(__dirname, "..", "submodules", "projects", "tech-stacks");

function parseArgs(): Args {
  const args: Args = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") args.dryRun = true;
    if (arg === "--force") args.force = true;
    if (arg === "--tag" && argv[i + 1]) {
      args.tag = argv[i + 1];
      i++;
    }
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
      const scenarioDirs = fs.readdirSync(stackPath).filter(scenarioName => {
        const scenarioPath = path.join(stackPath, scenarioName);
        return fs.statSync(scenarioPath).isDirectory();
      });

      const projects: string[] = [];
      scenarioDirs.forEach(scenarioDir => {
        const scenarioPath = path.join(stackPath, scenarioDir);
        const projectDirs = fs.readdirSync(scenarioPath).filter(projectName => {
          const projectPath = path.join(scenarioPath, projectName);
          // Skip project.md, readme.md, and other non-directory files
          if (!fs.statSync(projectPath).isDirectory()) {
            return false;
          }
          
          // Check if directory contains at least some project files (e.g., package.json, src folder)
          const projectFiles = fs.readdirSync(projectPath);
          return projectFiles.some(file => {
            // Check for common project files
            if (file === 'package.json' || file === 'package-lock.json' || file === 'tsconfig.json' || file === 'src') {
              return true;
            }
            
            // Also check if there are any subdirectories (like client/server)
            const filePath = path.join(projectPath, file);
            return fs.statSync(filePath).isDirectory();
          });
        });
        
        projectDirs.forEach(projectDir => {
          projects.push(path.join(scenarioDir, projectDir));
        });
      });
      
      stacks.push({
        name: stackDir,
        scenarios: scenarioDirs,
        projects,
      });
    }
  }

  return stacks;
}

function normalizeStackName(stackName: string): string {
  return stackName.toLowerCase().replace(/[_ ]+/g, "-");
}

function normalizeProjectName(projectPath: string): string {
  return projectPath.toLowerCase().replace(/[\\/_ ]+/g, "-");
}

function getImageName(stackName: string, projectName: string, tagPrefix: string): string {
  const normalizedStack = normalizeStackName(stackName);
  const normalizedProject = normalizeProjectName(projectName);
  return `${tagPrefix}:${normalizedStack}-${normalizedProject}`;
}

async function imageExists(imageName: string): Promise<boolean> {
  try {
    await execAsync(`docker image inspect ${imageName}`);
    return true;
  } catch {
    return false;
  }
}

async function buildProjectImage(
  stackName: string,
  projectPath: string,
  imageName: string,
  dryRun: boolean
): Promise<boolean> {
  const [scenarioDir, projectDir] = projectPath.split("/");
  const fullProjectPath = path.join(TECH_STACKS_BASE_PATH, stackName, scenarioDir, projectDir);

  console.log(`\n--- ${stackName}/${projectPath} ---`);
  console.log(`  Image: ${imageName}`);
  console.log(`  Source: ${fullProjectPath}`);

  if (dryRun) {
    console.log("  Status: Would build (dry run)");
    return true;
  }

  // Check if project directory actually exists
  if (!fs.existsSync(fullProjectPath)) {
    console.error(`  ✗ Project directory not found: ${fullProjectPath}`);
    return false;
  }

  // Create a temporary Dockerfile for this project
  const tempDockerfile = path.join(__dirname, "temp-Dockerfile");
  
  try {
    // Base image configuration
    const dockerfileContent = `
FROM devsim-workspace:latest

# Label the image with project information
LABEL devsim.stack="${stackName}"
LABEL devsim.project="${projectPath}"
LABEL devsim.image.version="1.0.0"

# Copy project files into image
COPY --chown=postgres:postgres . /workspace/

# Set working directory
WORKDIR /workspace

# Set permissions
RUN chown -R postgres:postgres /workspace
RUN chmod -R 755 /workspace

CMD ["/entrypoint.sh"]
`.trim();

    fs.writeFileSync(tempDockerfile, dockerfileContent);

    // Build the image - use the project directory as the build context
    console.log("  Building image...");
    const buildCmd = `cd "${fullProjectPath}" && docker build -f "${tempDockerfile}" -t "${imageName}" --build-arg PROJECT_PATH="${fullProjectPath}" .`;
    await execAsync(buildCmd);
    
    console.log("  ✓ Image built successfully");
    return true;
  } catch (err) {
    console.error(`  ✗ Failed to build image: ${err}`);
    return false;
  } finally {
    // Clean up temporary Dockerfile
    if (fs.existsSync(tempDockerfile)) {
      fs.unlinkSync(tempDockerfile);
    }
  }
}

async function main() {
  const args = parseArgs();
  const tagPrefix = args.tag || "devsim-project";

  console.log("\n=== DevSim Project Image Builder ===\n");

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
      const imageName = getImageName(stack.name, project, tagPrefix);
      console.log(`    - ${project} → ${imageName}`);
      totalProjects++;
    }
  }

  console.log(`\nTotal: ${totalProjects} image(s) to build`);

  if (args.dryRun) {
    console.log("\n--dry-run flag provided, exiting after listing images");
    return;
  }

  // Build images
  console.log("\n=== Building Images ===\n");

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const stack of filteredStacks) {
    for (const project of stack.projects) {
      const imageName = getImageName(stack.name, project, tagPrefix);
      
      // Check if already exists (unless force)
      if (!args.force) {
        const exists = await imageExists(imageName);
        if (exists) {
          console.log(`\n--- ${stack.name}/${project} ---`);
          console.log(`  Status: Already exists (skipping)`);
          skipped++;
          continue;
        }
      }

      const result = await buildProjectImage(stack.name, project, imageName, false);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }
  }

  console.log("\n=== Results ===");
  console.log(`Built: ${success} | Skipped: ${skipped} | Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
