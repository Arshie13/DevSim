import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SeasonService } from '$lib/layers/service/SeasonService';

const seasonService = new SeasonService();

export const GET: RequestHandler = async (event) => {
  try {
    const season = await seasonService.getCurrentSeason();
    if (!season) {
      throw error(404, 'No active season found');
    }

    const daysRemaining = await seasonService.getDaysRemaining(season.id);

    return json({
      season: {
        id: season.id,
        name: season.name,
        slug: season.slug,
        description: season.description,
        startDate: season.startDate,
        endDate: season.endDate,
        isActive: season.isActive,
        xpReset: season.xpReset
      },
      daysRemaining
    });
  } catch (err) {
    console.error('Error fetching season info:', err);
    throw error(500, 'Failed to fetch season information');
  }
};
