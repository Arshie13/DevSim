import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { docker } from "$lib/server/docker/client";

export const POST: RequestHandler = async ({ params, request }) => {
  try {
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
      await new Promise<void>((resolve) => {
        stream.on("end", resolve);
      });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error creating file:", error);
    return json({ success: false, error: String(error) });
  }
};
