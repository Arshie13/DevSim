import cron from 'node-cron';
import type { ScheduledTask } from 'node-cron';
import { SeasonService } from '$lib/layers/service/SeasonService';

let cronJob: ScheduledTask | null = null;

/**
 * Starts the season management cron job.
 *
 * Schedule configurable via SEASON_CRON_SCHEDULE env var.
 * Default: hourly at minute 0 (0 * * * *)
 *
 * The cron job checks if the active season has ended and automatically
 * transitions to a new season if needed.
 */
export function startSeasonCron() {
  if (cronJob) {
    console.log('[SeasonCron] Already started, skipping');
    return cronJob;
  }

  const schedule = process.env.SEASON_CRON_SCHEDULE || '0 * * * *'; // hourly by default
  const seasonService = new SeasonService();

  cronJob = cron.schedule(schedule, async () => {
    console.log('[SeasonCron] Checking for season transition...');
    try {
      const result = await seasonService.advanceSeasonIfNeeded();
      if (result.transitioned) {
        console.log(`[SeasonCron] ✅ Season transitioned: ${result.oldSeason?.name} → ${result.newSeason?.name}`);
      } else {
        console.log('[SeasonCron] No transition needed');
      }
    } catch (err: any) {
      console.error('[SeasonCron] ❌ Error during season transition:', err.message);
    }
  }, {
    timezone: 'UTC'
  });

  console.log(`[SeasonCron] Scheduled with pattern: ${schedule} (UTC)`);
  return cronJob;
}
