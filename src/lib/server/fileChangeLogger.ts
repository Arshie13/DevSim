import prisma from './client';

export type FileChangeAction = 'CREATE' | 'WRITE' | 'DELETE' | 'RENAME';

export interface FileChangeLogParams {
  containerId: string;
  userId: string;
  filePath: string;
  action: FileChangeAction;
  oldPath?: string;
  contentHash?: string;
}

/**
 * Logs a file change to the database
 * This function is called by file operation endpoints to track user modifications
 */
export async function logFileChange(params: FileChangeLogParams) {
  try {

    const prismaContainer = await prisma.workspace.findFirst({
      where: {
        container_id: params.containerId
      },
      select: {
        id: true
      }
    })

    if (!prismaContainer) {
      return null
    }

    const fileChange = await prisma.file_changes.create({
      data: {
        workspace_id: prismaContainer?.id,
        file_path: params.filePath,
        action: params.action,
        old_path: params.oldPath || null,
        content_hash: params.contentHash || null,
      },
    });
    return fileChange;
  } catch (error) {
    console.error('Error logging file change:', error);
    // Don't throw - file tracking shouldn't break file operations
    return null;
  }
}

/**
 * Retrieves all file changes for a container
 */
export async function getFileChanges(containerId: string): Promise<{
  id: string;
  workspaceId: string;
  filePath: string;
  action: string;
  oldPath: string | null;
  contentHash: string | null;
  timestamp: Date;
}[] | []> {
  try {
    const prismaContainer = await prisma.workspace.findFirst({
      where: {
        container_id: containerId
      },
      select: {
        id: true
      }
    });

    if (!prismaContainer) {
      return [];
    }

    const changes = await prisma.file_changes.findMany({
      where: { workspace_id: prismaContainer.id },
      orderBy: { timestamp: 'asc' },
    });
    return changes.map(change => ({
      id: change.id,
      workspaceId: change.workspace_id,
      filePath: change.file_path,
      action: change.action,
      oldPath: change.old_path,
      contentHash: change.content_hash,
      timestamp: change.timestamp,
    }));
  } catch (error) {
    console.error('Error fetching file changes:', error);
    return [];
  }
}

/**
 * Gets a summary of file changes (grouped by action type)
 */
export async function getFileChangeSummary(containerId: string) {
  try {
    const prismaContainer = await prisma.workspace.findFirst({
      where: {
        container_id: containerId
      },
      select: {
        id: true
      }
    });

    if (!prismaContainer) {
      return {
        created: [],
        modified: [],
        deleted: [],
        renamed: [],
        totalChanges: 0,
      };
    }

    const changes = await prisma.file_changes.findMany({
      where: { workspace_id: prismaContainer.id },
      select: {
        action: true,
        file_path: true,
        timestamp: true,
      },
      orderBy: { timestamp: 'asc' },
    });

    const summary = {
      created: changes.filter(c => c.action === 'CREATE').map(c => c.file_path),
      modified: changes.filter(c => c.action === 'WRITE').map(c => c.file_path),
      deleted: changes.filter(c => c.action === 'DELETE').map(c => c.file_path),
      renamed: changes.filter(c => c.action === 'RENAME').map(c => ({ from: c.file_path, to: c.file_path })), // Note: oldPath would need to be captured
      totalChanges: changes.length,
    };

    return summary;
  } catch (error) {
    console.error('Error fetching file change summary:', error);
    return null;
  }
}

export async function clearFileLogs(containerId: string) {
  const prismaContainer = await prisma.workspace.findFirst({
    where: {
      container_id: containerId
    },
    select: {
      id: true
    }
  });

  if (!prismaContainer) {
    return;
  }

  await prisma.file_changes.deleteMany({
    where: {
      workspace_id: prismaContainer.id
    }
  });
}
