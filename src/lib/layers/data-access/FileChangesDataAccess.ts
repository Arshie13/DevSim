import prisma from "$lib/server/client";

export class FileChangesDataAccess {
  async getFileLogs(workspaceId: string) {
    const files = await prisma.user_file_changes.findMany({
      where: {
        workspace_id: workspaceId
      },
      select: {
        file_path: true,
      }
    });

    return files.map((file) => ({
      filePath: file.file_path
    }));
  }

  async clearUserFileChanges(workspaceId: string) {
    const res = await prisma.user_file_changes.deleteMany({
      where: {
        workspace_id: workspaceId
      }
    })

    return { success: true, data: res }
  }

  async createFileChange(workspaceId: string, filePath: string) {
    const res = await prisma.user_file_changes.create({
      data: {
        workspace_id: workspaceId,
        file_path: filePath,
        action: "CREATE"
      }
    });

    return { success: true, data: res }
  }
}