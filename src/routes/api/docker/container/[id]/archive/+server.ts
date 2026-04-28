import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WorkspaceService } from '$lib/layers/service/WorkspaceService';
import { unlockNewAchievements } from '$lib/server/achievements/unlock';

const workspaceService = new WorkspaceService();

export const POST: RequestHandler = async ({ params, locals }) => {
  const session = await locals.auth();

  if (!session?.user?.id) {
    return error(401, 'Unauthorized');
  }

  try {
    const result = await workspaceService.archiveWorkspace({
      dbContainerId: params.id,
      userId: session.user.id
    });

    const unlockedAchievements = await unlockNewAchievements(session.user.id);

    return json({
      success: true,
      volumeName: result.volumeName,
      dbContainerId: result.dbContainerId,
      unlockedAchievements,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // same mapping, unchanged
    if (message.includes('not found')) return error(404, message);
    if (message.includes('do not own')) return error(403, message);
    if (message.includes('Only completed')) return error(400, message);
    if (message.includes('already archived')) return error(409, message);

    console.error('Archive error:', err);
    return error(500, `Archive failed: ${message}`);
  }
};