import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { ContainerService } from "$lib/layers/service/ContainerService";
import { WorkspaceService } from "$lib/layers/service/WorkspaceService";
import { FileDataAccess } from "$lib/layers/data-access/FileDataAccess";
import { detectNewlyUnlockedAchievements } from "$lib/server/achievements/unlocks";

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

function hasPathTraversal(inputPath: string): boolean {
  const normalized = inputPath.replace(/\\/g, "/");
  return normalized.includes("../") || normalized.includes("..\\");
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
      return json(
        {
          success: false,
          error: "This root file is protected and cannot be modified.",
        },
        { status: 403 },
      );
    }

    if (hasPathTraversal(path)) {
      return json(
        {
          success: false,
          error: "Path traversal (../) is not allowed. Use relative paths within the workspace.",
        },
        { status: 400 },
      );
    }

    const containerService = new ContainerService();
    const workspaceService = new WorkspaceService();

    // Find workspace for file change logging
    const workspace = await workspaceService.findWorkspaceByContainerId(
      userId,
      containerId,
    );

    if (isDirectory) {
      await containerService.createDirectory(containerId, path);
    } else {
      await containerService.createFile(containerId, path);
    }

    // Log the file change
    if (workspace) {
      try {
        await workspaceService.createFileChanges(workspace.id, path);
      } catch (logErr) {
        console.warn("Failed to log file change (non-critical):", logErr);
      }
    }

    const newlyUnlocked = await detectNewlyUnlockedAchievements(userId);

    return json({ success: true, newlyUnlocked });
  } catch (error) {
    console.error("Error creating file:", error);
    return json({ success: false, error: String(error) });
  }
};
