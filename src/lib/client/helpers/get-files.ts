import { type ReadFilesResponse } from "$lib/contracts/response/ReadFilesResponse";

export async function getFiles(filePathList: string[], containerId: string) {
  try {
    const paths = filePathList.map(file => `/workspace/${file}`);
    const res = await fetch(`/api/docker/container/${containerId}/files/read-multiple`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    });
    const data = await res.json() as ReadFilesResponse;
    if (data.success) {
      return data.files;
    }
  } catch (e) {
    console.error(`Error reading files:`, e);
    return null;
  }
}
