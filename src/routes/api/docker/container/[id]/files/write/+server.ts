// src/routes/api/container/[id]/files/write/+server.ts
import { json, isHttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import nodePath from 'node:path';
import { docker } from '$lib/server/docker/client';
import { logFileChange } from '$lib/server/fileChangeLogger';
import { detectNewlyUnlockedAchievements } from '$lib/server/achievements/unlocks';
import { requireWorkspaceAccess, resolveWorkspacePath } from '$lib/server/docker/workspace-access';

const PROTECTED_PACKAGE_FILES = new Set([
  'package.json',
  'package-lock.json',
  'package.lock.json',
]);
const PROTECTED_ROOT_FILES = new Set([
  'README',
  'README.md',
  'README.txt',
  'readme',
  'readme.md',
  'readme.txt',
]);

function normalizeWorkspaceRelativePath(inputPath: string): string {
  return inputPath
    .replace(/\\/g, '/')
    .replace(/^\/workspace\/?/, '')
    .replace(/^\.\//, '')
    .trim();
}

function isProtectedRootFilePath(inputPath: string): boolean {
  const normalized = normalizeWorkspaceRelativePath(inputPath);
  if (!normalized) return false;
  const isProtectedPackageFile =
    PROTECTED_PACKAGE_FILES.has(normalized) ||
    normalized.includes('/package.json') ||
    normalized.includes('/package-lock.json') ||
    normalized.includes('/package.lock.json');
  if (isProtectedPackageFile) return true;
  return !normalized.includes('/') && PROTECTED_ROOT_FILES.has(normalized);
}

export const POST: RequestHandler = async ({ params, request, locals }) => {
  try {
    // --- Auth + ownership ---
    const { userId, containerId } = await requireWorkspaceAccess(locals, params.id);

    const { path, content } = await request.json();

    if (isProtectedRootFilePath(path)) {
      return json({ success: false, error: 'This root file is protected and cannot be modified.' }, { status: 403 });
    }

    // Absolute, workspace-confined path — also removes any shell metacharacters
    // from the `mkdir`/`cat` below by resolving `..` first.
    const resolvedPath = resolveWorkspacePath(path);

    const container = docker.getContainer(containerId);

    // argv form: the path and its directory are passed as arguments, never
    // interpolated into an `sh -c` string.
    const exec = await container.exec({
      Cmd: ['sh', '-c', 'mkdir -p "$1" && cat > "$2"', 'sh', nodePath.posix.dirname(resolvedPath), resolvedPath],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true
    });

    const stream = await exec.start({ hijack: true, stdin: true });
    stream.write(content);
    stream.end();

    // Log the file change
    await logFileChange({
      containerId,
      userId,
      filePath: path,
      action: 'WRITE',
    });

    const newlyUnlocked = await detectNewlyUnlockedAchievements(userId);

    return json({ success: true, newlyUnlocked });
  } catch (error) {
    if (isHttpError(error)) {
      throw error;
    }
    console.error('Error writing file:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};

