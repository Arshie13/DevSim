import { readFile } from '$lib/server/docker/user/read-file';

export class FileDataAccess {
  async readFileContent(filePath: string, containerId: string): Promise<{ content: string; error?: never } | { error: string; content?: never }> {
    try {
      const fullPath = `/workspace/${filePath}`;
      const result = await readFile(fullPath, containerId);
      if (result.error) {
        return { error: result.error };
      }
      return { content: result.content };
    } catch (error) {
      console.error('Error reading file:', error);
      return { error: String(error) };
    }
  }

  async listContainerFiles(containerId: string): Promise<{ success: boolean; files?: string[]; error?: string }> {
    try {
      const response = await fetch(`/api/docker/container/${containerId}/files/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching file list:', error);
      return { success: false, error: String(error) };
    }
  }
}
