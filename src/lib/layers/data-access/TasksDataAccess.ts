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

  async createCompletedTask(workspaceId: string, taskId: string) {
    try {
      await prisma.completed_task.create({
        data: {
          workspace_id: workspaceId,
          task_name: taskId
        }
      });

      return { success: true }
    } catch (error) {
      console.error('Error creating completed task:', error);
      return { success: false, error: error }
    }
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
