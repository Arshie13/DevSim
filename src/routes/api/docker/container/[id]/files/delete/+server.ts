import { json, isHttpError } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { docker } from "$lib/server/docker/client";
import { logFileChange } from "$lib/server/fileChangeLogger";
import { detectNewlyUnlockedAchievements } from "$lib/server/achievements/unlocks";
import { requireWorkspaceAccess, resolveWorkspacePath } from "$lib/server/docker/workspace-access";

const PROTECTED_PACKAGE_FILES = new Set([
  "package.json",
  "package-lock.json",
  "package.lock.json",
]);
const PROTECTED_ROOT_FILES = new Set([
  "README",
  "README.md",
  "README.txt",
  "readme",
  "readme.md",
  "readme.txt",
]);

function normalizeWorkspaceRelativePath(inputPath: string): string {
  return inputPath
    .replace(/\\/g, "/")
    .replace(/^\/workspace\/?/, "")
    .replace(/^\.\//, "")
    .trim();
}

function isProtectedRootFilePath(inputPath: string): boolean {
  const normalized = normalizeWorkspaceRelativePath(inputPath);
  if (!normalized) return false;
  const isProtectedPackageFile =
    PROTECTED_PACKAGE_FILES.has(normalized) ||
    normalized.includes("/package.json") ||
    normalized.includes("/package-lock.json") ||
    normalized.includes("/package.lock.json");
  if (isProtectedPackageFile) return true;
  return !normalized.includes("/") && PROTECTED_ROOT_FILES.has(normalized);
}

export const POST: RequestHandler = async ({ params, request, locals }) => {
  try {
    // --- Auth + ownership ---
    const { userId, containerId } = await requireWorkspaceAccess(locals, params.id);

    const { path } = await request.json();

    if (!path) {
      return json({ success: false, error: "Path is required" });
    }

    if (isProtectedRootFilePath(path)) {
      return json({ success: false, error: "This root file is protected and cannot be modified." }, { status: 403 });
    }

    // Confined to /workspace, and never the workspace root itself.
    const resolvedPath = resolveWorkspacePath(path);
    if (resolvedPath === "/workspace") {
      return json({ success: false, error: "Refusing to delete the workspace root" }, { status: 400 });
    }

    const container = docker.getContainer(containerId);

    // Use rm for files, rm -rf for directories
    const exec = await container.exec({
      Cmd: ["rm", "-rf", resolvedPath],
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

    const newlyUnlocked = await detectNewlyUnlockedAchievements(userId);

    return json({ success: true, newlyUnlocked });
  } catch (error) {
    if (isHttpError(error)) {
      throw error;
    }
    console.error("Error deleting file:", error);
    return json({ success: false, error: String(error) });
  }
};
