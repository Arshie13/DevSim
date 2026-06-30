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

  async createCompletedTask(workspaceId: string, taskId: string, userId: string, level: number) {
    try {
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          completed_tasks: {
            push: taskId
          }
        }
      });
    } catch (error) {
      console.error('Error adding completed task to workspace:', error);
      return { success: false, error };
    }

    try {
      const existing = await prisma.task_activity.findFirst({
        where: { user_id: userId, task_name: taskId }
      });
      if (!existing) {
        await prisma.task_activity.create({
          data: { user_id: userId, task_name: taskId, level }
        });
      }
    } catch (error) {
      console.error('Error recording task_activity (weekly activity will not update):', error);
      return { success: false, activityLogged: false, error };
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
