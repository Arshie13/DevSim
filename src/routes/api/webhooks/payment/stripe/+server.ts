import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PremiumPassService } from '$lib/layers/service/PremiumPassService';

const premiumService = new PremiumPassService();

export const POST: RequestHandler = async (event) => {
  const payload = await event.request.arrayBuffer();
  const signature = event.request.headers.get('stripe-signature');

  if (!signature) {
    throw error(400, 'Missing Stripe signature');
  }

  try {
    await premiumService.handleStripeWebhook(Buffer.from(payload), signature);
    return json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook error:', err);
    throw error(500, 'Webhook processing failed');
  }
};
