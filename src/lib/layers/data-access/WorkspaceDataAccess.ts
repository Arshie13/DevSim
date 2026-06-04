import prisma from '$lib/server/client';
import type { WorkspaceRow, WorkspaceStackRow } from '$lib/interface/Workspace';

function mapWorkspace(row: WorkspaceRow & { workspace_stacks?: WorkspaceStackRow[] }) {
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
    workspaceStacks: row.workspace_stacks?.map((s) => ({
      id: s.id,
      workspaceId: s.workspace_id,
      stackName: s.stackName,
      stackVersion: s.stackVersion
    }))
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
      include: {
        workspace_stacks: true
      }
    });
    return row ? mapWorkspace(row as unknown as WorkspaceRow & { workspace_stacks: WorkspaceStackRow[] }) : null;
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
    const activeWorkspaces = await prisma.workspace.findMany({
      where: {
        user_id: userId,
        level,
        is_archived: false
      },
      include: {
        workspace_stacks: true
      }
    });

    const stackNames = stacks.map(s => s.stackName);
    for (const ws of activeWorkspaces) {
      const existingStackNames = (ws.workspace_stacks || []).map(s => s.stack_name);
      const stacksMatch = stackNames.length === existingStackNames.length &&
        stackNames.every(sn => existingStackNames.includes(sn));
      if (stacksMatch) {
        return mapWorkspace(ws as unknown as WorkspaceRow & { workspace_stacks: WorkspaceStackRow[] });
      }
    }
    return null;
  }

  async findWorkspaceById(id: string) {
    return prisma.workspace.findUnique({
      where: { id }
    });
  }

  async findWorkspaceStacks(workspaceId: string) {
    return prisma.workspace_stack.findMany({
      where: { workspace_id: workspaceId }
    });
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
