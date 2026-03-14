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
    const { path } = await request.json();
    const containerId = params.id;

    if (!path) {
      return json({ success: false, error: "Path is required" });
    }

    const container = docker.getContainer(containerId);
    
    // Use rm for files, rm -rf for directories
    const exec = await container.exec({
      Cmd: ["rm", "-rf", path],
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
      filePath: path,
      action: 'DELETE',
    });

    return json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return json({ success: false, error: String(error) });
  }
};
