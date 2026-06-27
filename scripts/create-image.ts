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
 *   --tutorial-tag TAG Custom tag prefix for tutorial images (default: devsim-project-tutorial)
 */

//TODO: use volume for shared node_modules for each project.
//TODO: create only on postgres instance and have each project connect to that, each with unique database name.

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
  tutorialTag?: string;
}

interface TechStack {
  name: string;
  scenarios: string[];
  projects: string[];
  tutorialProjects: string[];
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
    if (arg === "--tutorial-tag" && argv[i + 1]) {
      args.tutorialTag = argv[i + 1];
      i++;
    }
  }

  return args;
}

function isProjectDirectory(projectPath: string): boolean {
  if (!fs.existsSync(projectPath) || !fs.statSync(projectPath).isDirectory()) {
    return false;
  }

  const projectFiles = fs.readdirSync(projectPath);
  const hasPackage = projectFiles.includes('package.json') || projectFiles.includes('package-lock.json');
  const hasReadme = projectFiles.some((file) => /^readme(\..+)?$/i.test(file));
  const hasClientServerDirs = ['client', 'server'].every((dirName) => {
    const fullPath = path.join(projectPath, dirName);
    return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
  });

  // A project folder must have either package metadata or a clear full-stack structure.
  // This avoids treating wrapper folders (e.g. tutorial/) as standalone projects.
  return hasPackage || (hasReadme && hasClientServerDirs);
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
        return fs.statSync(scenarioPath).isDirectory() && /^scenario-\d+$/i.test(scenarioName);
      });

      const projects: string[] = [];
      scenarioDirs.forEach(scenarioDir => {
        const scenarioPath = path.join(stackPath, scenarioDir);
        const projectDirs = fs.readdirSync(scenarioPath).filter(projectName =>
          isProjectDirectory(path.join(scenarioPath, projectName))
        );
        
        projectDirs.forEach(projectDir => {
          // CHANGE 1: Store projects as posix-style paths (forward slashes) regardless of OS.
          // Previously used path.join() which produces backslashes on Windows, causing
          // inconsistent splitting later in buildProjectImage(). Using '/' directly here
          // ensures a consistent separator we can reliably split on.
          projects.push(`${scenarioDir}/${projectDir}`);
        });
      });

      const tutorialProjects: string[] = [];
      const tutorialBasePath = path.join(stackPath, 'tutorial');

      if (fs.existsSync(tutorialBasePath) && fs.statSync(tutorialBasePath).isDirectory()) {
        const directTutorialIsProject = isProjectDirectory(tutorialBasePath);
        if (directTutorialIsProject) {
          tutorialProjects.push('tutorial');
        } else {
          const tutorialProjectDirs = fs
            .readdirSync(tutorialBasePath, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .filter((projectName) => isProjectDirectory(path.join(tutorialBasePath, projectName)))
            .sort((a, b) => {
              const aPreferred = /to[-_ ]?do[-_ ]?list/i.test(a) ? 0 : 1;
              const bPreferred = /to[-_ ]?do[-_ ]?list/i.test(b) ? 0 : 1;
              return aPreferred - bPreferred;
            });

          // Build exactly one tutorial image per stack.
          // If tutorial is wrapped by a subfolder (e.g. TO_DO_LIST), keep image name as "...-tutorial"
          // but build from that project folder.
          if (tutorialProjectDirs.length > 0) {
            tutorialProjects.push(`tutorial/${tutorialProjectDirs[0]}`);
          }
        }
      }
      
      stacks.push({
        name: stackDir,
        scenarios: scenarioDirs,
        projects,
        tutorialProjects,
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
  const projectPathSegments = projectPath.split("/").filter(Boolean);
  if (projectPathSegments.length === 0) {
    console.error(`  ✗ Could not parse project path: "${projectPath}"`);
    return false;
  }

  const fullProjectPath = path.join(TECH_STACKS_BASE_PATH, stackName, ...projectPathSegments);

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
  const originalDockerignoreContent = dockerignoreAlreadyExisted
    ? fs.readFileSync(dockerignorePath, "utf-8")
    : null;
  let dockerignoreWasModified = false;

  try {
    // openssl + libstdc++ are required by Prisma's query/schema engine on Alpine (musl)
    // for the nestjs stack only. Without them Prisma fails to detect libssl, falls back
    // to the openssl-1.1.x engine, and crashes with "Could not parse schema engine
    // response" at migrate/seed. We add it here per-stack instead of in the base
    // Dockerfile so the shared devsim-workspace base stays lean and the other stacks'
    // images don't get invalidated/rebuilt when this fix changes.
    const needsOpenssl = /nestjs/i.test(stackName);
    const opensslLayer = needsOpenssl
      ? "\nRUN apk add --no-cache openssl libstdc++\n"
      : "";

    const dockerfileContent = `
FROM devsim-workspace:latest

LABEL devsim.stack="${stackName}"
LABEL devsim.project="${projectPath}"
LABEL devsim.image.version="1.0.0"
${opensslLayer}
COPY --chown=postgres:postgres . /workspace/

WORKDIR /workspace

RUN rm -rf /workspace/node_modules /workspace/client/node_modules /workspace/server/node_modules

RUN chown -R postgres:postgres /workspace
RUN chmod -R 755 /workspace
`.trim();

    fs.writeFileSync(tempDockerfile, dockerfileContent);

    const nodeModulesEntries = ["node_modules", "**/node_modules"];
    if (!dockerignoreAlreadyExisted) {
      fs.writeFileSync(dockerignorePath, [
        "node_modules",
        "**/node_modules",
        ".git",
        "*.log",
        ".env",
      ].join("\n"));
    } else {
      // Merge node_modules exclusion into existing .dockerignore without overwriting it.
      // An existing .dockerignore may not exclude node_modules, which causes corrupted
      // node_modules from the host to be copied into the image and break npm install at runtime.
      const existingLines = originalDockerignoreContent!.split("\n").map((l) => l.trim());
      const missingEntries = nodeModulesEntries.filter((e) => !existingLines.includes(e));
      if (missingEntries.length > 0) {
        fs.writeFileSync(dockerignorePath, originalDockerignoreContent + "\n" + missingEntries.join("\n"));
        dockerignoreWasModified = true;
      }
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

    if (!dockerignoreAlreadyExisted && fs.existsSync(dockerignorePath)) {
      fs.unlinkSync(dockerignorePath);
    } else if (dockerignoreWasModified && originalDockerignoreContent !== null) {
      fs.writeFileSync(dockerignorePath, originalDockerignoreContent);
    }
  }
}

async function main() {
  const args = parseArgs();
  const tagPrefix = args.tag || "devsim-project";
  const tutorialTagPrefix = args.tutorialTag || "devsim-project-tutorial";

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
    console.log(`  ${stack.name} (${stack.projects.length} project(s), ${stack.tutorialProjects.length} tutorial project(s))`);
    for (const project of stack.projects) {
      const imageName = getImageName(stack.name, project, tagPrefix);
      console.log(`    - ${project} → ${imageName}`);
      totalProjects++;
    }

    for (const tutorialProject of stack.tutorialProjects) {
      const tutorialImageName = getImageName(stack.name, 'tutorial', tutorialTagPrefix);
      console.log(`    - ${tutorialProject} [tutorial] → ${tutorialImageName}`);
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

    for (const tutorialProject of stack.tutorialProjects) {
      const tutorialImageName = getImageName(stack.name, 'tutorial', tutorialTagPrefix);

      if (!args.force) {
        const exists = await imageExists(tutorialImageName);
        if (exists) {
          console.log(`\n--- ${stack.name}/${tutorialProject} [tutorial] ---`);
          console.log(`  Status: Already exists (skipping)`);
          skipped++;
          continue;
        }
      }

      const tutorialResult = await buildProjectImage(stack.name, tutorialProject, tutorialImageName, false);
      if (tutorialResult) {
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