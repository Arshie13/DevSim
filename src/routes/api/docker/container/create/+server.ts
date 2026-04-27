import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WorkspaceService } from '$lib/layers/service/WorkspaceService';

export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    const session = await locals.auth();

    if (!session || !session.user || !session.user.id) {
      return error(401, 'Unauthorized');
    }

    const userId = session.user.id;
    const req = await request.json();
    const { stackName, level, stacks, scenarioId, projectFolder, scenarioTitle, mode } = req;

    const service = new WorkspaceService();
    const result = await service.createOrReuseWorkspace({
      userId,
      stackName,
      level,
      stacks,
      scenarioId: scenarioId || undefined,
      projectFolder: projectFolder || undefined,
      scenarioTitle: scenarioTitle || '',
      mode: mode === 'tutorial' ? 'tutorial' : 'workspace'
    });

    return json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error handling container request:', err);

    // FK violation — stale session whose userId no longer exists in the DB
    if (message.includes('not found in database') || message.includes('session')) {
      return json({ success: false, error: message }, { status: 401 });
    }

    return json({ success: false, error: message }, { status: 500 });
  }
};
