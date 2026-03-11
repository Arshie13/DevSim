import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { docker } from "$lib/server/docker/client";
import { logFileChange } from "$lib/server/fileChangeLogger";

export const POST: RequestHandler = async ({ params, request, locals }) => {
  try {
    // --- Auth check ---
    const session = await locals.auth();
    if (!session?.user?.id) {
      return json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { oldPath, newPath } = await request.json();
    const containerId = params.id;

    if (!oldPath || !newPath) {
      return json({ success: false, error: "Old path and new path are required" });
    }

    const container = docker.getContainer(containerId);
    
    // Rename file or directory using mv command
    const exec = await container.exec({
      Cmd: ["mv", oldPath, newPath],
      AttachStdout: true,
      AttachStderr: true,
    });
    const stream = await exec.start({ hijack: true });
    await new Promise<void>((resolve) => {
      stream.on("end", resolve);
    });

    // Log the file change
    await logFileChange({
      containerId,
      userId,
      filePath: newPath,
      action: 'RENAME',
      oldPath: oldPath,
    });

    return json({ success: true });
  } catch (error) {
    console.error("Error renaming file:", error);
    return json({ success: false, error: String(error) });
  }
};
