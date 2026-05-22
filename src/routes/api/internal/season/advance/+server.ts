import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SeasonService } from '$lib/layers/service/SeasonService';

const seasonService = new SeasonService();
const CRON_SECRET = process.env.SEASON_CRON_SECRET;

export const POST: RequestHandler = async (event) => {
  // Verify secret token
  const authHeader = event.request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!CRON_SECRET || token !== CRON_SECRET) {
    throw error(401, 'Unauthorized');
  }

  try {
    const result = await seasonService.advanceSeasonIfNeeded();

    if (result.transitioned) {
      console.log(`[Season Cron] Transitioned from ${result.oldSeason?.name} to ${result.newSeason?.name}`);
    }

    return json({
      transitioned: result.transitioned,
      season: result.newSeason || result.oldSeason
    });
  } catch (err: any) {
    console.error('[Season Cron] Error:', err);
    throw error(500, 'Cron failed');
  }
};
