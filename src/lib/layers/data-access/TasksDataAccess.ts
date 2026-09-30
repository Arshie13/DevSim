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

        // De-duplication is the unique constraint's job now, not a read-then-write check.
        // The old guard keyed on (user_id, task_name), which is not unique across scenarios
        // — "Prepare Development Environment" exists in 12 of them — so completing that task
        // in a second scenario recorded nothing at all.
        await tx.task_activity.createMany({
          data: [{ user_id: userId, scenario_id: scenarioId, task_name: taskName, level }],
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
