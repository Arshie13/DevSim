import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { docker } from "$lib/server/docker/client";
import { logFileChange } from "$lib/server/fileChangeLogger";

const PROTECTED_ROOT_FILES = new Set(["package.json", "package-lock.json", "package.lock.json"]);

function normalizeWorkspaceRelativePath(inputPath: string): string {
  return inputPath
    .replace(/\\/g, "/")
    .replace(/^\/workspace\/?/, "")
    .replace(/^\.\//, "")
    .trim();
}

function isProtectedRootFilePath(inputPath: string): boolean {
  const normalized = normalizeWorkspaceRelativePath(inputPath);
  return normalized.length > 0 && !normalized.includes("/") && PROTECTED_ROOT_FILES.has(normalized);
}

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

    if (isProtectedRootFilePath(path)) {
      return json({ success: false, error: "This root file is protected and cannot be modified." }, { status: 403 });
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

      const execResult = await exec.inspect();
      if (execResult.ExitCode !== 0) {
        return json({ success: false, error: `mkdir failed with code ${execResult.ExitCode}` }, { status: 500 });
      }
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

      const execResult = await exec.inspect();
      if (execResult.ExitCode !== 0) {
        return json({ success: false, error: `touch failed with code ${execResult.ExitCode}` }, { status: 500 });
      }
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
