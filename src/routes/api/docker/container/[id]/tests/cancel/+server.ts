import { json, isHttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { docker } from '$lib/server/docker/client';
import { requireWorkspaceAccess } from '$lib/server/docker/workspace-access';

// Best-effort test cancel: kill common pnpm/vitest/jest test commands inside the container.
export const POST: RequestHandler = async ({ params, locals }) => {
  try {
    // --- Auth + ownership ---
    const { containerId } = await requireWorkspaceAccess(locals, params.id);

    const container = docker.getContainer(containerId);

    const exec = await container.exec({
      Cmd: [
        'sh',
        '-c',
        "pkill -f 'pnpm run test' || true; pkill -f 'npm run test' || true; pkill -f 'vitest' || true; pkill -f 'jest' || true; pkill -f 'node .*test' || true"
      ],
      AttachStdout: false,
      AttachStderr: false,
      AttachStdin: false,
      Tty: false,
      WorkingDir: '/workspace',
    });

    await exec.start({ hijack: false, stdin: false });

    return json({ success: true, canceled: true });
  } catch (error) {
    if (isHttpError(error)) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Failed to cancel running tests';
    return json({ success: false, canceled: false, message }, { status: 500 });
  }
};
