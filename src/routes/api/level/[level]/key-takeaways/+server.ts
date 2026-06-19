/**
 * GET /api/level/[level]/key-takeaways?scenarioId=...
 *
 * Returns the key takeaways for a specific level from the database.
 *
 * The same level `order` exists across every scenario/tech-stack, so the
 * `scenarioId` query param must be supplied to return the takeaways for the
 * caller's actual scenario. Without it, findFirst would return whichever
 * scenario was seeded first (e.g. the PERN stack), surfacing the wrong copy.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';

export const GET: RequestHandler = async ({ params, url }) => {
  const levelOrder = parseInt(params.level);
  const scenarioId = url.searchParams.get('scenarioId');

  if (isNaN(levelOrder)) {
    return json({ success: false, error: 'Invalid level number' }, { status: 400 });
  }

  try {
    const level = await prisma.level.findFirst({
      where: {
        order: levelOrder,
        ...(scenarioId ? { scenario_id: scenarioId } : {})
      },
      select: {
        key_takeaways: true,
        title: true
      }
    });

    if (!level) {
      return json({ success: false, error: 'Level not found' }, { status: 404 });
    }

    return json({
      success: true,
      keyTakeaways: level.key_takeaways,
      levelTitle: level.title
    });
  } catch (error) {
    console.error('Error fetching level key takeaways:', error);
    return json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};