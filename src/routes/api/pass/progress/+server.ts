import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PassProgressionService } from '$lib/layers/service/PassProgressionService';
import { SeasonService } from '$lib/layers/service/SeasonService';
import { PremiumPassService } from '$lib/layers/service/PremiumPassService';
import { PassRewardService } from '$lib/layers/service/PassRewardService';

const passService = new PassProgressionService();
const seasonService = new SeasonService();
const premiumService = new PremiumPassService();
const rewardService = new PassRewardService();

export const GET: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  try {
    const userId = session.user.id;
    const result = await passService.getUserProgress(userId);

    if (!result) {
      throw error(404, 'No active season progression found');
    }

    const season = result.season;
    const progression = result.progression;
    const levelInfo = progression.levelInfo;

    // Get premium status
    const premiumStatus = await premiumService.getUserPremiumStatus(userId);

    // Calculate days remaining
    const now = new Date();
    const endDate = new Date(season.endDate);
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    // Get claimed rewards to compute isClaimed
    const claimedRewardIds = await rewardService.getClaimedRewards(userId, season.id);

    // Build rewards array (available only: unlocked and not claimed)
    const freeRewards = result.availableRewards.free
      .filter(r => r.isUnlocked && !claimedRewardIds.includes(r.id))
      .map(r => ({
        id: r.id,
        level: r.level,
        type: r.rewardType,
        value: r.rewardValue,
        claimed: false,
        requiresPremium: false
      }));

    const premiumRewards = result.availableRewards.premium
      .filter(r => r.isUnlocked && !claimedRewardIds.includes(r.id))
      .map(r => ({
        id: r.id,
        level: r.level,
        type: r.rewardType,
        value: r.rewardValue,
        claimed: false,
        requiresPremium: true
      }));

    return json({
      season: {
        id: season.id,
        name: season.name,
        endDate: season.endDate,
        daysRemaining
      },
      progression: {
        seasonXp: progression.seasonXp,
        level: levelInfo.level,
        xpToNextLevel: levelInfo.xpToNext,
        freeTrackLevel: progression.freeTrackLevel,
        premiumTrackLevel: progression.premiumTrackLevel ?? 0
      },
      rewards: [...freeRewards, ...premiumRewards],
      premium: {
        hasPremium: premiumStatus.hasPremium,
        expiresAt: premiumStatus.expiresAt
      }
    });
  } catch (err) {
    console.error('Error fetching pass progress:', err);
    throw error(500, 'Failed to fetch progression');
  }
};
