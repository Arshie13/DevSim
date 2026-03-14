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
    const { path, isDirectory } = await request.json();
    const containerId = params.id;

    if (!path) {
      return json({ success: false, error: "Path is required" });
    }

    const container = docker.getContainer(containerId);

    if (isDirectory) {
      // Create directory using exec
      const exec = await container.exec({
        Cmd: ["mkdir", "-p", path],
        AttachStdout: true,
        AttachStderr: true,
      });
      const stream = await exec.start({ hijack: true });
      await new Promise<void>((resolve) => {
        stream.on("end", resolve);
      });
    } else {
      // Create empty file using exec
      const exec = await container.exec({
        Cmd: ["touch", path],
        AttachStdout: true,
        AttachStderr: true,
      });
      const stream = await exec.start({ hijack: true });
      docker.modem.demuxStream(stream, process.stdout, process.stderr);

      await new Promise<void>((resolve) => {
        stream.on("end", resolve);
      });
    }

    // Log the file change
    await logFileChange({
      containerId,
      userId,
      filePath: path,
      action: isDirectory ? 'CREATE' : 'CREATE',
    });

    return json({ success: true });
  } catch (error) {
    console.error("Error creating file:", error);
    return json({ success: false, error: String(error) });
  }
};
