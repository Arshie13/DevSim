import prisma from '$lib/server/client';

export class TasksDataAccess {
  async getCurrentCompletedTasks(workspaceId: string) {
    try {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { completed_tasks: true }
      });

      if (!workspace) {
        return {
          success: false,
          status: 404,
          error: 'Workspace not found'
        }
      }

      return {
        success: true,
        completedTasks: workspace.completed_tasks.map(taskName => ({
          taskName
        }))
      };
    } catch (error) {
      console.log('Error fetching completed tasks: ', error);
      return {
        success: false,
        status: 500,
        error: error
      }
    }
  }

  async createCompletedTask(
    workspaceId: string,
    scenarioId: string,
    taskName: string,
    userId: string,
    level: number
  ) {
    try {
      await prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.findUnique({
          where: { id: workspaceId },
          select: { completed_tasks: true }
        });

        if (!workspace?.completed_tasks.includes(taskName)) {
          await tx.workspace.update({
            where: { id: workspaceId },
            data: {
              completed_tasks: {
                push: taskName
              }
            }
          });
        }

        // Resolve the task to its level_task so activity is linked by id, not by name.
        // Callers only know (scenario, level order, task name); the FK needs the row id.
        const levelTask = await tx.level_task.findFirst({
          where: {
            task_name: taskName,
            level: { scenario_id: scenarioId, order: level },
          },
          select: { id: true },
        });

        if (!levelTask) {
          // Nothing to link to — e.g. a board task that isn't in the catalog. The board
          // state above is already saved; don't fail the submission over the activity log.
          console.warn(
            `[TasksDataAccess] No level_task for scenario=${scenarioId} level=${level} task="${taskName}"; skipping activity log.`
          );
          return;
        }

        // De-duplication is the unique constraint's job now, not a read-then-write check.
        await tx.task_activity.createMany({
          data: [{ user_id: userId, level_task_id: levelTask.id }],
          skipDuplicates: true,
        });
      });
    } catch (error) {
      console.error('Error adding completed task to workspace:', error);
      return { success: false, error };
    }

    return { success: true };
  }

  async deleteCompletedTasks(workspaceId: string) {
    try {
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { completed_tasks: [] }
      });

      return { success: true };
    } catch (error) {
      console.log('Error clearing completed tasks: ', error);
      return {
        success: false,
        error: error
      }
    }
  }
}
