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

  const record = await prisma.container.findFirst({
    where: { id: dbId, userId },
    select: { 
      id: true,
      containerId: true, 
      status: true,
      level: true
    }
  });

  // Get level info based on container's current level
  let levelTasks: string[] = [];
  let levelTitle = '';
  let hints: string[] = [];
  
  if (record) {
    const level = await prisma.level.findFirst({
      where: { order: record.level },
      orderBy: { order: 'asc' },
      include: {
        tasks: {
          orderBy: { order: 'asc' }
        },
        hints: {
          orderBy: { order: 'asc' }
        }
      }
    });
    if (level) {
      levelTasks = level.tasks.map(t => t.taskName);
      levelTitle = level.title || '';
      hints = level.hints.map(h => h.content);
    }
  }

  // Get completed tasks from the CompletedTask table
  const completedTaskRecords = await prisma.completedTask.findMany({
    where: { containerId: record?.id },
    select: { taskName: true }
  });
  const completedTaskNames = completedTaskRecords.map(r => r.taskName);

  return {
    user: session.user,
    userId: user?.id || "",
    userCoins: user?.coins || 0,
    // The actual Docker container ID — used by the client for all Docker API calls
    dockerContainerId: record?.containerId ?? null,
    // Level info for tasks
    level: record?.level || 1,
    completedTasks: completedTaskNames,
    levelTasks,
    levelTitle,
    hints
  };
};
