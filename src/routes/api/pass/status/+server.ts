import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PremiumPassService } from '$lib/layers/service/PremiumPassService';

const premiumService = new PremiumPassService();

export const GET: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  try {
    const status = await premiumService.getUserPremiumStatus(session.user.id);
    return json(status);
  } catch (err) {
    console.error('Error fetching premium status:', err);
    throw error(500, 'Failed to fetch premium status');
  }
};
