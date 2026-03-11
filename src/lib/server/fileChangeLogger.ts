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

    const prismaContainer = await prisma.container.findFirst({
      where: {
        containerId: params.containerId
      },
      select: {
        id: true
      }
    })

    if (!prismaContainer) {
      return null
    }

    const fileChange = await prisma.fileChange.create({
      data: {
        containerId: prismaContainer?.id,
        userId: params.userId,
        filePath: params.filePath,
        action: params.action,
        oldPath: params.oldPath || null,
        contentHash: params.contentHash || null,
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
export async function getFileChanges(containerId: string) {
  try {
    const changes = await prisma.fileChange.findMany({
      where: { containerId },
      orderBy: { timestamp: 'asc' },
    });
    return changes;
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
    const changes = await prisma.fileChange.findMany({
      where: { containerId },
      select: {
        action: true,
        filePath: true,
        timestamp: true,
      },
      orderBy: { timestamp: 'asc' },
    });

    const summary = {
      created: changes.filter(c => c.action === 'CREATE').map(c => c.filePath),
      modified: changes.filter(c => c.action === 'WRITE').map(c => c.filePath),
      deleted: changes.filter(c => c.action === 'DELETE').map(c => c.filePath),
      renamed: changes.filter(c => c.action === 'RENAME').map(c => ({ from: c.filePath, to: c.filePath })), // Note: oldPath would need to be captured
      totalChanges: changes.length,
    };

    return summary;
  } catch (error) {
    console.error('Error fetching file change summary:', error);
    return null;
  }
}
