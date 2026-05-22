import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import { SeasonService } from '$lib/layers/service/SeasonService';

const seasonService = new SeasonService();

export const GET: RequestHandler = async (event) => {
  try {
    const activeSeason = await seasonService.getCurrentSeason();
    if (!activeSeason) {
      throw error(404, 'No active season');
    }

    const limit = 50;

    const topUsers = await prisma.user_season_progression.findMany({
      where: { season_id: activeSeason.id },
      orderBy: { seasonXp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            level: true,
            xp: true
          }
        }
      }
    });

    const leaderboard = topUsers.map((entry, index) => ({
      rank: index + 1,
      userId: entry.user.id,
      username: entry.user.username,
      name: entry.user.name,
      avatar: entry.user.image ?? '🧑‍💻',
      seasonXp: entry.seasonXp,
      level: entry.user.level
    }));

    return json({
      season: {
        id: activeSeason.id,
        name: activeSeason.name
      },
      leaderboard
    });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    throw error(500, 'Failed to fetch leaderboard');
  }
};
