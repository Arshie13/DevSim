import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PremiumPassService } from '$lib/layers/service/PremiumPassService';
import { SeasonService } from '$lib/layers/service/SeasonService';
import { checkRateLimit } from '$lib/server/ratelimit';

const premiumService = new PremiumPassService();
const seasonService = new SeasonService();

// Rate limit: 5 purchase attempts per hour per user
const PURCHASE_LIMIT = 5;
const PURCHASE_WINDOW_MS = 60 * 60_000; // 1 hour

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  const userId = session.user.id;

  // Rate limiting check
  const rateLimitKey = `purchase:${userId}`;
  if (!checkRateLimit(rateLimitKey, PURCHASE_LIMIT, PURCHASE_WINDOW_MS)) {
    throw error(429, 'Too many purchase attempts. Please try again later.');
  }

  try {
    // Get active season
    const activeSeason = await seasonService.getCurrentSeason();
    if (!activeSeason) {
      throw error(400, 'No active season available');
    }

    const { checkoutUrl } = await premiumService.createCheckoutSession(
      userId,
      activeSeason.id,
      'stripe'
    );

    return json({ checkoutUrl });
  } catch (err: any) {
    console.error('Error creating purchase:', err);
    if (err.message.includes('not configured')) {
      throw error(503, 'Payment system not configured');
    }
    throw error(500, 'Failed to create checkout session');
  }
};
