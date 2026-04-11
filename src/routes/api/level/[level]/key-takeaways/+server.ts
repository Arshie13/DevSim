/**
 * GET /api/level/[level]/key-takeaways
 *
 * Returns the key takeaways for a specific level from the database.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';

export const GET: RequestHandler = async ({ params }) => {
  const levelOrder = parseInt(params.level);

  if (isNaN(levelOrder)) {
    return json({ success: false, error: 'Invalid level number' }, { status: 400 });
  }

  try {
    const level = await prisma.level.findFirst({
      where: { order: levelOrder },
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