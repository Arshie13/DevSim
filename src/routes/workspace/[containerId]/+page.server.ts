import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/client";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, '/');
  }

  // Get user data including coins
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, coins: true, name: true }
  });

  // The route param is now always the Prisma Container.id (cuid).
  // The Docker container ID is an internal detail stored in record.containerId.
  const dbId = event.params.containerId;
  const userId = session.user.id;

  const container = await prisma.container.findFirst({
    where: { id: dbId, userId },
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
                  acceptanceCriteria: true
                }
              }
            }
          }
        }
      }
    }
  });

  console.log("Loaded container data:", container);

  // Get completed tasks from the CompletedTask table
  // id might be wrong
  const completedTaskRecords = await prisma.completedTask.findMany({
    where: { containerId: container?.id },
    select: { taskName: true }
  });
  const completedTaskNames = completedTaskRecords.map(r => r.taskName);

  // Extract level tasks - try record.scenario first, fallback to direct level query
  let currentLevel = container?.scenario?.levels?.find(l => l.order === container.level);
  
  // If scenario is null (currentScenarioId not set), fallback to querying Level directly
  if (!currentLevel && container?.level) {
    const fallbackLevel = await prisma.level.findFirst({
      where: { order: container.level },
      include: {
        tasks: {
          orderBy: { order: "asc" },
          include: {
            hints: true,
            acceptanceCriteria: true
          }
        }
      }
    });
    if (fallbackLevel) {
      currentLevel = fallbackLevel;
    }
  }
  
  const levelTasks = currentLevel?.tasks?.map(t => t.taskName) || [];

  return {
    user: session.user,
    userId: user?.id || "",
    userCoins: user?.coins || 0,
    // The actual Docker container ID — used by the client for all Docker API calls
    dockerContainerId: container?.containerId ?? null,
    // Level info for tasks
    level: container?.level || 1,
    completedTasks: completedTaskNames,
    levelTasks: levelTasks,
    container: container,
    hints: currentLevel?.tasks?.flatMap(t => t.hints) || [],
  };
};
