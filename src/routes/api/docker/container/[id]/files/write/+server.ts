// src/routes/api/container/[id]/files/write/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { docker } from '$lib/server/docker/client';
import { logFileChange } from '$lib/server/fileChangeLogger';

const PROTECTED_ROOT_FILES = new Set(['package.json', 'package-lock.json', 'package.lock.json']);

function normalizeWorkspaceRelativePath(inputPath: string): string {
  return inputPath
    .replace(/\\/g, '/')
    .replace(/^\/workspace\/?/, '')
    .replace(/^\.\//, '')
    .trim();
}

function isProtectedRootFilePath(inputPath: string): boolean {
  const normalized = normalizeWorkspaceRelativePath(inputPath);
  return normalized.length > 0 && !normalized.includes('/') && PROTECTED_ROOT_FILES.has(normalized);
}

export const POST: RequestHandler = async ({ params, request, locals }) => {
  try {
    // --- Auth check ---
    const session = await locals.auth();
    if (!session?.user?.id) {
      return json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { path, content } = await request.json();
    const containerId = params.id;

    if (isProtectedRootFilePath(path)) {
      return json({ success: false, error: 'This root file is protected and cannot be modified.' }, { status: 403 });
    }

    const container = docker.getContainer(containerId);

    const exec = await container.exec({
      Cmd: ['sh', '-c', `mkdir -p $(dirname ${path}) && cat > ${path}`],
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

    return json({ success: true });
  } catch (error) {
    console.error('Error writing file:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};

