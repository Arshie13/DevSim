import { randomUUID } from 'node:crypto';
import prisma from '$lib/server/client';
import type { TaskActivityEntry } from '$lib/types/dashboard';

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
    try {
      await prisma.completed_task.create({
        data: {
          workspace_id: workspaceId,
          task_name: taskId
        }
      });
    } catch (error) {
      console.error('Error creating completed_task row:', error);
      return { success: false, error };
    }

    // Append-only activity log stored on the user — survives
    // deleteCompletedTasks, which wipes completed_task rows on every level
    // advance. Read-modify-write the JSON array (fine at per-user task scale).
    // Isolated in its own try/catch so a failure here is reported distinctly
    // instead of being masked by (or masking) the completed_task write above —
    // this log is what drives the dashboard "Weekly Activity" chart.
    try {
      const u = await prisma.user.findUnique({
        where: { id: userId },
        select: { task_activity: true }
      });
      const log: TaskActivityEntry[] = Array.isArray(u?.task_activity)
        ? (u!.task_activity as unknown as TaskActivityEntry[])
        : [];
      log.push({
        id: randomUUID(),
        task_name: taskId,
        level,
        completed_at: new Date().toISOString()
      });
      await prisma.user.update({
        where: { id: userId },
        data: { task_activity: log as never }
      });
    } catch (error) {
      console.error('Error appending task_activity (weekly activity will not update):', error);
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
