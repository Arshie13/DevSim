/**
 * POST /api/docker/container/[id]/tasks/complete
 *
 * Records a task as completed in the database (idempotent) and checks
 * whether the user has newly unlocked any achievements. Called after a
 * task's automated test passes.
 *
 * Does NOT award XP/coins — those come from the sprint submission flow.
 */
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import { unlockNewAchievements } from '$lib/server/achievements/unlock';

export const POST: RequestHandler = async ({ params, locals, request }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    return error(401, 'Unauthorized');
  }

  const body = await request.json();
  const taskName: string | undefined = body?.taskName;

  if (!taskName) {
    return error(400, 'Missing taskName');
  }

  const workspace = await prisma.workspace.findFirst({
    where: { container_id: params.id, user_id: session.user.id },
    select: { id: true },
  });

  if (!workspace) {
    return error(404, 'Workspace not found');
  }

  const existing = await prisma.completed_task.findFirst({
    where: { workspace_id: workspace.id, task_name: taskName },
  });

  if (!existing) {
    await prisma.completed_task.create({
      data: { workspace_id: workspace.id, task_name: taskName },
    });
  }

  const unlockedAchievements = await unlockNewAchievements(session.user.id);

  return json({ success: true, unlockedAchievements });
};
