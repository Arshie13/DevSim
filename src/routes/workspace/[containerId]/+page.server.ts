import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/client";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, "/");
  }

  // Get user data including coins and username
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, coins: true, name: true, username: true, aiHelpCredits: true },
  });

  // Validate that username from subdomain matches the user's actual username
  if (event.locals.username && event.locals.username !== user?.username) {
    throw redirect(303, "/");
  }

  // The route param is now always the Prisma Container.id (cuid).
  // The Docker container ID is an internal detail stored in record.containerId.
  const dbId = event.params.containerId;
  const userId = session.user.id;

  const container = await prisma.workspace.findFirst({
    where: { id: dbId, user_id: userId },
    include: {
      scenario: {
        include: {
          levels: {
            orderBy: { order: "asc" },
            include: {
              tasks: {
                orderBy: { order: "asc" },
                include: {
                  hints: true,
                  acceptance_criteria: true,
                  learning_sections: {
                    orderBy: { order: "asc" }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (container?.status === 'tutorial') {
    throw redirect(303, `/tutorial/${container.id}`);
  }

  const scenario = await prisma.scenario.findFirst({
    where: {
      id: container?.scenario.id
    }
  });

  const level = await prisma.level.findFirst({
    where: {
      scenario_id: scenario?.id,
      order: container?.level
    }
  });

  // Get completed tasks from the CompletedTask table
  // id might be wrong
  const completedTaskRecords = await prisma.completed_task.findMany({
    where: { workspace_id: container?.id },
    select: { id: true, task_name: true }
  });
  const completedTaskNames = completedTaskRecords.map(r => r.task_name);

  // Extract level tasks - try record.scenario first, fallback to direct level query
  let currentLevel = container?.scenario.levels?.find(l => l.order === container.level);

  let currentLevelV2 = await prisma.level.findMany({
    where: {
      scenario_id: scenario?.id,
      order: container?.level
    },
    include: {
      tasks: {
        include: {
          hints: true,
          learning_sections: true,
          acceptance_criteria: true
        }
      },
    }
  });
  
  // If scenario is null (currentScenarioId not set), fallback to querying Level directly
  if (!currentLevel && container?.level) {
    const fallbackLevel = await prisma.level.findFirst({
      where: { order: container.level },
      include: {
        tasks: {
          orderBy: { order: "asc" },
          include: {
            hints: true,
            acceptance_criteria: true,
            learning_sections: {
              orderBy: { order: "asc" }
            }
          }
        }
      }
    });
    if (fallbackLevel) {
      currentLevel = fallbackLevel;
    }
  }
   
   const levelTasks = currentLevel?.tasks?.map(t => ({
    taskName: t.task_name,
    order: t.order,
  })) || [];

   // Fetch app settings
   const masterySetting = await prisma.app_setting.findUnique({
     where: { key: 'mastery_checkpoint_enabled' }
   });
   const masteryCheckpointEnabled = masterySetting ? masterySetting.value === 'true' : true;

   // AI help credits — these are spent before coins are charged.
   const userAiHelps = user?.aiHelpCredits ?? 0;

   return {
     user: session.user,
     userId: user?.id || "",
     userCoins: user?.coins || 0,
     userAiHelps,
     // The actual Docker container ID — used by the client for all Docker API calls
     dockerContainerId: container?.container_id ?? null,
     // Level info for tasks
     level: container?.level || 1,
     completedTasks: completedTaskNames,
     currentLevel: currentLevelV2,
     levelTasks: levelTasks,
     container: container,
     stackName: container?.stack_name ?? null,
     stackVersion: container?.stack_version ?? null,
     scenario,
     scenarioLevels: level,
     hints: currentLevel?.tasks?.flatMap(t => t.hints) || [],
     masteryCheckpointEnabled
   };
 };