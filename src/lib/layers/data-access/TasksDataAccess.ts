import prisma from '$lib/server/client';

export class TasksDataAccess {
  async getCurrentCompletedTasks(workspaceId: string) {
    try {
      const completedTasks = await prisma.completed_task.findMany({
        where: { workspace_id: workspaceId },
        select: { task_name: true }
      });
  
      if (!completedTasks) {
        return {
          success: false,
          status: 404,
          error: 'No completed tasks found'
        }
      }
  
      return {
        success: true,
        completedTasks: completedTasks.map(task => ({
          taskName: task.task_name
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
    // Board state — idempotent per (workspace, task) so re-running a passing
    // test doesn't trip the @@unique([workspace_id, task_name]) constraint.
    try {
      await prisma.completed_task.upsert({
        where: {
          workspace_id_task_name: { workspace_id: workspaceId, task_name: taskId }
        },
        create: { workspace_id: workspaceId, task_name: taskId },
        update: {}
      });
    } catch (error) {
      console.error('Error creating completed_task row:', error);
      return { success: false, error };
    }

    // Durable activity log in its own table — survives deleteCompletedTasks,
    // which wipes completed_task rows on every level advance. Isolated in its
    // own try/catch so a failure here is reported distinctly instead of being
    // masked by (or masking) the completed_task write above. Backs the dashboard
    // weekly chart, activity feed, and lifetime tasks-completed stat.
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
      await prisma.completed_task.deleteMany({
        where: { workspace_id: workspaceId }
      });

      return { success: true };
    } catch (error) {
      console.log('Error deleting completed tasks: ', error);
      return {
        success: false,
        error: error
      }
    }
  }
}
