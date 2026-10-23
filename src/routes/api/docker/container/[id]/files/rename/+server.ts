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

    const { oldPath, newPath } = await request.json();

    if (!oldPath || !newPath) {
      return json({ success: false, error: "Old path and new path are required" });
    }

    if (isProtectedRootFilePath(oldPath) || isProtectedRootFilePath(newPath)) {
      return json({ success: false, error: "This root file is protected and cannot be modified." }, { status: 403 });
    }

    // Both paths confined to /workspace; the workspace root itself cannot be moved.
    const resolvedOld = resolveWorkspacePath(oldPath, "oldPath");
    const resolvedNew = resolveWorkspacePath(newPath, "newPath");
    if (resolvedOld === "/workspace" || resolvedNew === "/workspace") {
      return json({ success: false, error: "Refusing to rename the workspace root" }, { status: 400 });
    }

    const container = docker.getContainer(containerId);

    // Rename file or directory using mv command
    const exec = await container.exec({
      Cmd: ["mv", resolvedOld, resolvedNew],
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

    const newlyUnlocked = await detectNewlyUnlockedAchievements(userId);

    return json({ success: true, newlyUnlocked });
  } catch (error) {
    if (isHttpError(error)) {
      throw error;
    }
    console.error("Error renaming file:", error);
    return json({ success: false, error: String(error) });
  }
};
