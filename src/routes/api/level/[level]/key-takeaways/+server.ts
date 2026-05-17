/**
 * GET /api/level/[level]/key-takeaways
 *
 * Returns the key takeaways for a specific level from the database.
 * Pass ?containerId=<dockerContainerId> to scope the lookup to the container's
 * current scenario — required when multiple scenarios share the same level order.
 * Matches the Docker-container-id pattern used by /submit and /archive.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';

export const GET: RequestHandler = async ({ params, url }) => {
  const levelOrder = parseInt(params.level);

  if (isNaN(levelOrder)) {
    return json({ success: false, error: 'Invalid level number' }, { status: 400 });
  }

  const dockerContainerId = url.searchParams.get('containerId');

  try {
    let scenarioId: string | undefined;
    if (dockerContainerId) {
      const container = await prisma.container.findFirst({
        where: { containerId: dockerContainerId },
        select: { currentScenarioId: true }
      });
      scenarioId = container?.currentScenarioId ?? undefined;
    }

    const level = await prisma.level.findFirst({
      where: scenarioId
        ? { order: levelOrder, scenarioId }
        : { order: levelOrder },
      select: {
        keyTakeaways: true,
        title: true
      }
    });

    if (!level) {
      return json({ success: false, error: 'Level not found' }, { status: 404 });
    }

    return json({
      success: true,
      keyTakeaways: level.keyTakeaways,
      levelTitle: level.title
    });
  } catch (error) {
    console.error('Error fetching level key takeaways:', error);
    return json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};