import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PassProgressionService } from '$lib/layers/service/PassProgressionService';
import { PassRewardService } from '$lib/layers/service/PassRewardService';

const passService = new PassProgressionService();
const rewardService = new PassRewardService();

export const GET: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  try {
    const userId = session.user.id;
    const progress = await passService.getUserProgress(userId);

    if (!progress) {
      throw error(404, 'No active season progression');
    }

    const seasonId = progress.season.id;
    const userFreeLevel = progress.progression.freeTrackLevel;
    const userPremiumLevel = progress.progression.premiumTrackLevel ?? 0;

    // Fetch claimed rewards
    const claimedRewards = await rewardService.getClaimedRewards(userId, seasonId);

    // Build full reward lists
    const freeRewards = await passService.getRewardsForPass(seasonId, 'FREE');
    const premiumRewards = await passService.getRewardsForPass(seasonId, 'PREMIUM');

    return json({
      season: {
        id: progress.season.id,
        name: progress.season.name,
        slug: progress.season.slug,
        startDate: progress.season.startDate,
        endDate: progress.season.endDate,
        isActive: progress.season.isActive
      },
      progression: {
        seasonXp: progress.progression.seasonXp,
        freeTrackLevel: userFreeLevel,
        premiumTrackLevel: userPremiumLevel,
        xpToNextLevel: progress.progression.levelInfo.xpToNext,
        isMaxLevel: progress.progression.levelInfo.isMaxLevel
      },
      rewards: {
        free: freeRewards.map(r => ({
          id: r.id,
          level: r.level,
          rewardType: r.rewardType,
          rewardValue: r.rewardValue,
          xpRequired: r.xpRequired,
          isClaimable: r.isClaimable && userFreeLevel >= r.level && !claimedRewards.includes(r.id),
          isUnlocked: userFreeLevel >= r.level,
          isClaimed: claimedRewards.includes(r.id)
        })),
        premium: premiumRewards.map(r => ({
          id: r.id,
          level: r.level,
          rewardType: r.rewardType,
          rewardValue: r.rewardValue,
          xpRequired: r.xpRequired,
          isClaimable: r.isClaimable && userPremiumLevel >= r.level && !claimedRewards.includes(r.id),
          isUnlocked: userPremiumLevel >= r.level,
          isClaimed: claimedRewards.includes(r.id)
        }))
      }
    });
  } catch (err) {
    console.error('Error fetching rewards:', err);
    throw error(500, 'Failed to fetch rewards');
  }
};
