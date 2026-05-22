import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PassRewardService } from '$lib/layers/service/PassRewardService';
import { RewardClaimLogDataAccess } from '$lib/layers/data-access/RewardClaimLogDataAccess';
import { checkRateLimit } from '$lib/server/ratelimit';

const rewardService = new PassRewardService();
const claimLogDao = new RewardClaimLogDataAccess();

// Rate limit: 10 claims per minute per user
const CLAIM_LIMIT = 10;
const CLAIM_WINDOW_MS = 60_000;

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  const userId = session.user.id;

  // Rate limiting check
  const rateLimitKey = `claim:${userId}`;
  if (!checkRateLimit(rateLimitKey, CLAIM_LIMIT, CLAIM_WINDOW_MS)) {
    throw error(429, 'Too many reward claim attempts. Please wait a moment and try again.');
  }

  try {
    const body = await event.request.json();
    const { rewardId, passType } = body;

    if (!rewardId || !passType) {
      throw error(400, 'rewardId and passType are required');
    }

    if (!['FREE', 'PREMIUM'].includes(passType)) {
      throw error(400, 'Invalid pass type');
    }

    const result = await rewardService.claimReward(userId, rewardId, passType);

    // Successful claim logged inside service

    return json({
      success: true,
      reward: result.reward
    });
  } catch (err: any) {
    // Log failed claim attempt
    const body = await event.request.json().catch(() => ({}));
    await claimLogDao.logClaim({
      userId,
      rewardId: body.rewardId || 'unknown',
      seasonId: '', // unknown, will need to be fetched if needed
      success: false,
      error: err.message
    }).catch(() => {
      /* ignore logging errors to avoid masking original error */
    });

    console.error('Error claiming reward:', err);
    if (err.message.includes('already claimed')) {
      throw error(409, err.message);
    }
    if (err.message.includes('required level')) {
      throw error(403, err.message);
    }
    throw error(500, 'Failed to claim reward');
  }
};
