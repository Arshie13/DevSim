import prisma from '$lib/server/client';
import { WorkspaceDataAccess } from './WorkspaceDataAccess';

export class FileDataAccess {
  private workspace = new WorkspaceDataAccess();

  async findWorkspaceByContainerId(userId: string, containerId: string) {
    return this.workspace.findWorkspaceByContainerId(userId, containerId);
  }

  async createFileChange(params: {
    workspaceId: string;
    userId: string;
    filePath: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    content?: string;
  }) {
    const { workspaceId, filePath, action, content } = params;

    return prisma.user_file_changes.create({
      data: {
        workspace_id: workspaceId,
        file_path: filePath,
        action,
        content_hash: content || null
      }
    });
  }

  async getWorkspaceByContainerId(containerId: string) {
    return prisma.workspace.findFirst({
      where: { container_id: containerId },
      select: { id: true, user_id: true }
    });
  }
}
