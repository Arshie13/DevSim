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
          if (!fs.statSync(projectPath).isDirectory()) {
            return false;
          }
          
          const projectFiles = fs.readdirSync(projectPath);
          return projectFiles.some(file => {
            if (file === 'package.json' || file === 'package-lock.json' || file === 'tsconfig.json' || file === 'src') {
              return true;
            }
            const filePath = path.join(projectPath, file);
            return fs.statSync(filePath).isDirectory();
          });
        });
        
        projectDirs.forEach(projectDir => {
          // CHANGE 1: Store projects as posix-style paths (forward slashes) regardless of OS.
          // Previously used path.join() which produces backslashes on Windows, causing
          // inconsistent splitting later in buildProjectImage(). Using '/' directly here
          // ensures a consistent separator we can reliably split on.
          projects.push(`${scenarioDir}/${projectDir}`);
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
  // CHANGE 2: Split on '/' only (forward slash), since we now store project paths
  // with forward slashes consistently in getTechStacks(). Previously split on /[\\/]/
  // which was a workaround for the mixed separator issue — now it's avoided at the source.
  const [scenarioDir, projectDir] = projectPath.split("/");

  // CHANGE 3: Added a guard to catch undefined scenarioDir or projectDir early.
  // If the split fails for any reason, we log a clear error instead of passing
  // undefined into path.join() which throws a cryptic ERR_INVALID_ARG_TYPE.
  if (!scenarioDir || !projectDir) {
    console.error(`  ✗ Could not parse project path: "${projectPath}" (expected format: "scenario-X/PROJECT_NAME")`);
    return false;
  }

  const fullProjectPath = path.join(TECH_STACKS_BASE_PATH, stackName, scenarioDir, projectDir);

  console.log(`\n--- ${stackName}/${projectPath} ---`);
  console.log(`  Image: ${imageName}`);
  console.log(`  Source: ${fullProjectPath}`);

  if (dryRun) {
    console.log("  Status: Would build (dry run)");
    return true;
  }

  if (!fs.existsSync(fullProjectPath)) {
    console.error(`  ✗ Project directory not found: ${fullProjectPath}`);
    return false;
  }

  const tempDockerfile = path.join(__dirname, "temp-Dockerfile");

  // CHANGE 4: Generate a .dockerignore file inside the project directory before building.
  // This prevents node_modules (and other bloat) from being sent to the Docker build context.
  // Without this, projects with node_modules cause the build to fail with:
  //   "archive/tar: unknown file mode ?rwxr-xr-x"
  // because Windows can't properly handle Linux symlinks inside node_modules/.bin/.
  // We track the path so we can clean it up in the finally block.
  const dockerignorePath = path.join(fullProjectPath, ".dockerignore");
  const dockerignoreAlreadyExisted = fs.existsSync(dockerignorePath);

  try {
    const dockerfileContent = `
FROM devsim-workspace:latest

LABEL devsim.stack="${stackName}"
LABEL devsim.project="${projectPath}"
LABEL devsim.image.version="1.0.0"

COPY --chown=postgres:postgres . /workspace/

WORKDIR /workspace

RUN chown -R postgres:postgres /workspace
RUN chmod -R 755 /workspace

CMD ["/entrypoint.sh"]
`.trim();

    fs.writeFileSync(tempDockerfile, dockerfileContent);

    // CHANGE 4 (continued): Write .dockerignore only if one doesn't already exist,
    // so we don't overwrite a custom .dockerignore the project author may have set up.
    if (!dockerignoreAlreadyExisted) {
      fs.writeFileSync(dockerignorePath, [
        "node_modules",
        "**/node_modules",
        ".git",
        "*.log",
        ".env",
      ].join("\n"));
    }

    console.log("  Building image...");
    const buildCmd = `cd "${fullProjectPath}" && docker build -f "${tempDockerfile}" -t "${imageName}" --build-arg PROJECT_PATH="${fullProjectPath}" .`;
    await execAsync(buildCmd);
    
    console.log("  ✓ Image built successfully");
    return true;
  } catch (err) {
    console.error(`  ✗ Failed to build image: ${err}`);
    return false;
  } finally {
    // Clean up temp Dockerfile
    if (fs.existsSync(tempDockerfile)) {
      fs.unlinkSync(tempDockerfile);
    }

    // CHANGE 4 (continued): Only delete the .dockerignore if we created it.
    // If the project already had one, leave it untouched.
    if (!dockerignoreAlreadyExisted && fs.existsSync(dockerignorePath)) {
      fs.unlinkSync(dockerignorePath);
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

  console.log("\n=== Building Images ===\n");

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const stack of filteredStacks) {
    for (const project of stack.projects) {
      const imageName = getImageName(stack.name, project, tagPrefix);
      
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