import prisma from '$lib/server/client';
import type { WorkspaceRow } from '$lib/interface/Workspace';

function mapWorkspace(row: WorkspaceRow) {
  return {
    id: row.id,
    userId: row.user_id,
    level: row.level,
    status: row.status,
    containerId: row.container_id,
    currentScenarioId: row.current_scenario_id,
    startedAt: row.startedAt,
    stoppedAt: row.stoppedAt,
    volumeName: row.volume_name,
    isArchived: row.is_archived,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    stackName: row.stack_name,
    stackVersion: row.stack_version,
  };
}

export type WorkspaceWithStacks = ReturnType<typeof mapWorkspace>;

export class WorkspaceDataAccess {
  async findActiveWorkspace(userId: string, level: number) {
    const row = await prisma.workspace.findFirst({
      where: {
        user_id: userId,
        level,
        is_archived: false
      },
    });
    return row ? mapWorkspace(row as unknown as WorkspaceRow) : null;
  }

  async findIncompleteWorkspace(userId: string) {
    const row = await prisma.workspace.findFirst({
      where: {
        user_id: userId,
        is_archived: false,
        status: { not: 'completed' },
      },
      orderBy: { updated_at: 'desc' },
    });
    return row ? mapWorkspace(row as unknown as WorkspaceRow) : null;
  }

  async findWorkspaceByContainerId(userId: string, containerId: string) {
    const row = await prisma.workspace.findFirst({
      where: {
        user_id: userId,
        container_id: containerId
      }
    });
    return row ? mapWorkspace(row as unknown as WorkspaceRow) : null;
  }

  async findActiveWorkspaceByStacks(userId: string, level: number, stacks: Array<{ stackName: string }>) {
    const stackName = stacks.map(s => s.stackName).join('-');
    const activeWorkspaces = await prisma.workspace.findMany({
      where: {
        user_id: userId,
        level,
        is_archived: false,
        stack_name: stackName,
        status: { not: 'completed' },
      }
    });

    if (activeWorkspaces.length > 0) {
      return mapWorkspace(activeWorkspaces[0] as unknown as WorkspaceRow);
    }
    return null;
  }

  async findWorkspaceById(id: string) {
    return prisma.workspace.findUnique({
      where: { id }
    });
  }

  async findWorkspaceStacks(workspaceId: string) {
    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { stack_name: true, stack_version: true }
    });
    return ws ? [{ stack_name: ws.stack_name ?? '', stack_version: ws.stack_version }] : [];
  }

  async archiveWorkspace(workspaceId: string, volumeName: string) {
    return prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        volume_name: volumeName,
        is_archived: true,
        stopped_at: new Date()
      }
    });
  }

  async deleteWorkspace(workspaceId: string) {
    try {
      await prisma.workspace.deleteMany({
        where: { id: workspaceId }
      });
      return { success: true };
    } catch (err) {
      console.error('Error deleting workspace:', err);
      return { success: false, error: String(err) };
    }
  }

  async stopWorkspace(workspaceId: string) {
    try {
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          status: 'stopped',
          stopped_at: new Date()
        }
      });

      return { success: true }
    } catch (err) {
      console.error('Background container stop failed:', err);
    }
  }

  async updateWorkspaceStatus(workspaceId: string, status: string, incrementLevel: boolean) {
    try {

      if (!incrementLevel) {
        await prisma.workspace.update({
          where: { id: workspaceId },
          data: {
            status,
            stopped_at: status === 'completed' ? new Date() : null
          }
        });
      } else {
        await prisma.workspace.update({
          where: { id: workspaceId },
          data: {
            status,
            level: { increment: 1 },
          }
        });
      }

      return { success: true }
    } catch (error) {
      console.log('Error updating workspace status: ', error);
      return {
        success: false,
        error: error
      }
    }
  }
}
