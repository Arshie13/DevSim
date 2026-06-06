import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/client";
import fs from "fs";
import path from "path";
import { reflectionConcepts } from "$lib/data/reflectionConcepts";
import { resolveConfigKey, selectStackForConfig } from "$lib/data/postassessmentConfigs";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, "/");
  }

  // Get the user's most recent container (the one they're doing post-assessment for)
  const latestContainer = await prisma.workspace.findFirst({
    where: { user_id: session.user.id },
    orderBy: { created_at: "desc" },
    include: {
      completed_tasks: {
        select: { task_name: true, completed_at: true }
      },
      workspace_stacks: true,
      scenario: {
        include: {
          levels: {
            orderBy: { order: "asc" },
            include: {
              tasks: {
                orderBy: { order: "asc" },
                select: { id: true, task_name: true }
              }
            }
          }
        }
      }
    }
  });

  if (!latestContainer) {
    // No container found - redirect to dashboard
    return {
      completedTasks: [],
      stackName: "react-express-postgres-prisma",
      concepts: []
    };
  }

  // Get completed task names
  const completedTaskNames = latestContainer.completed_tasks.map(t => t.task_name);

  // Resolve the stack for the post-assessment config. Prefer the scenario id when it
  // carries a real stack slug (e.g. "nextjs-postgres-prisma-1"); otherwise fall back to
  // the workspace_stacks slug (e.g. "react-express-postgresql-prisma"), which always
  // reflects the stack the user actually chose. Generic ids like "scenario-1" don't map
  // to a config, so they correctly fall through to the workspace stack rather than
  // silently landing on the default screen.
  const scenarioId = latestContainer.scenario?.id ?? latestContainer.current_scenario_id ?? "";
  const stackSlug = latestContainer.workspace_stacks[0]?.stack_name ?? "";
  const stackName = selectStackForConfig([scenarioId, stackSlug]);
  
  // Try to read key takeaways from the actual stack folder for completed tasks
  // Map stack names to folder paths
  const stackFolderMap: Record<string, string> = {
    "react-express-postgres-prisma": "react-express-postgres-prisma/scenario-1/LIBRARY_MANAGEMENT",
    "react-express": "react-express-postgres-prisma/scenario-1/LIBRARY_MANAGEMENT",
    "pern": "react-express-postgres-prisma/scenario-1/LIBRARY_MANAGEMENT",
    "nextjs-postgres-prisma": "nextjs-postgres-prisma/scenario-1/pos-system",
    "nestjs-postgres-prisma": "nestjs-postgres-prisma/scenario-1/MONEY_TRACKER",
    "nestjs-postgres": "nestjs-postgres-prisma/scenario-1/MONEY_TRACKER",
    "nextjs-prisma": "nextjs/scenario-1",
    "nextjs": "nextjs/scenario-1"
  };
  
  // Normalize to the folder-map key (handles "postgresql"→"postgres" and any trailing
  // scenario number) using the same resolver as the config lookup.
  const folderKey = resolveConfigKey(stackName);
  const stackFolder = stackFolderMap[folderKey] || "react-express-postgres-prisma/scenario-1/LIBRARY_MANAGEMENT";
  const basePath = path.join(process.cwd(), "submodules", "projects", "tech-stacks", stackFolder, "levels");
  
  // Dynamic concepts from completed tasks
  const concepts: { id: string; concept: string; category: string }[] = [];
  
  // Try to read keytakeaway files for completed levels/tasks
  try {
    if (fs.existsSync(basePath)) {
      const levels = fs.readdirSync(basePath);
      
      for (const levelDir of levels) {
        // Check if this level was completed (level-1, level-2, etc)
        const levelNum = parseInt(levelDir.replace("level-", ""));
        
        // Only look at completed levels
        if (latestContainer.level && levelNum > latestContainer.level) continue;
        
        const levelPath = path.join(basePath, levelDir);
        if (!fs.statSync(levelPath).isDirectory()) continue;
        
        // Look at tasks in this level
        const tasks = fs.readdirSync(levelPath);
        
        for (const taskDir of tasks) {
          const taskPath = path.join(levelPath, taskDir);
          if (!fs.statSync(taskPath).isDirectory()) continue;
          
          const taskName = taskDir; // e.g., "task-1", "task-2"
          
          // Read keytakeaway.md if it exists
          const ktPath = path.join(taskPath, "keytakeaway.md");
          if (fs.existsSync(ktPath)) {
            const ktContent = fs.readFileSync(ktPath, "utf-8");
            
            // Extract concepts from keytakeaway - look for **bold** text or key phrases
            const boldMatches = ktContent.match(/\*\*(.*?)\*\*/g) || [];
            
            for (const match of boldMatches) {
              const conceptText = match.replace(/\*\*/g, "");
              if (conceptText.length > 10 && conceptText.length < 100) {
                concepts.push({
                  id: `${levelDir}-${taskName}-${concepts.length}`,
                  concept: conceptText,
                  category: `Level ${levelNum}`
                });
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("Error reading key takeaways:", e);
  }

  // If no concepts found dynamically, use fallback
  if (concepts.length === 0) {
    concepts.push(
      { id: "fallback-1", concept: "Full-stack development concepts", category: "General" },
      { id: "fallback-2", concept: "API design & integration", category: "General" },
      { id: "fallback-3", concept: "Database schema design", category: "General" },
      { id: "fallback-4", concept: "Error handling & debugging", category: "General" },
      { id: "fallback-5", concept: "Code organization & best practices", category: "General" }
    );
  }

  // Shape the scenario's levels + tasks for the reflection UI. Each level
  // becomes a "topic"; concept chips come from the curated reflectionConcepts
  // list, falling back to the level's task names if the scenario isn't mapped.
  const scenarioLevels = (latestContainer.scenario?.levels ?? []).map((lvl, idx) => {
    const order = lvl.order ?? idx + 1;
    const curated = reflectionConcepts[scenarioId]?.[order - 1];
    return {
      id: `level${order}`,
      name: `Level ${order}: ${lvl.title}`,
      concepts:
        curated && curated.length > 0
          ? curated
          : lvl.tasks.map((t) => t.task_name),
    };
  });

  return {
    completedTasks: completedTaskNames,
    stackName: stackName,
    concepts: concepts.slice(0, 20), // Limit to 20 concepts max
    containerId: latestContainer.id,
    scenarioLevels,
    scenarioName: latestContainer.scenario?.name ?? null,
  };
};
