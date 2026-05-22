import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AIHelpLimitService } from '$lib/layers/service/AIHelpLimitService';

const aiHelpService = new AIHelpLimitService();

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const userId = session.user.id;

  try {
    const remaining = await aiHelpService.getRemainingHelps(userId);

    return json({
      remaining: {
        today: remaining.freeRemaining,
        total: remaining.limit
      },
      isPremium: remaining.isPremium,
      limit: remaining.limit,
      used: remaining.totalUsed
    });
  } catch (err) {
    console.error('Error fetching AI help usage:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch usage' }), { status: 500 });
  }
};
