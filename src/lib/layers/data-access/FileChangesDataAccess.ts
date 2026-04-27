import prisma from "$lib/server/client";

export class FileChangesDataAccess {
  async getFileLogs(workspaceId: string) {
    const files =  await prisma.user_file_changes.findMany({
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
}