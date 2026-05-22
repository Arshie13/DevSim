import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SeasonService } from '$lib/layers/service/SeasonService';
import prisma from '$lib/server/client';

const seasonService = new SeasonService();

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  // Check admin role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!user || user.role !== 'ADMIN') {
    throw error(403, 'Admin only');
  }

  try {
    const body = await event.request.json();
    const { seasonName } = body;

    const newSeason = await seasonService.forceStartNewSeason(seasonName);

    return json({
      success: true,
      season: newSeason
    });
  } catch (err: any) {
    console.error('Error forcing new season:', err);
    throw error(500, 'Failed to start new season');
  }
};

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!user || user.role !== 'ADMIN') {
    throw error(403, 'Admin only');
  }

  // Return current season info
  const current = await seasonService.getCurrentSeason();
  return json({ currentSeason: current });
};
