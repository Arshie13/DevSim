import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import prisma from '$lib/server/client';
import Stripe from 'stripe';
import { checkRateLimit } from '$lib/server/ratelimit';
import { getLearnerPassConfirmationResult } from '$lib/server/learnerPass';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const LEARNER_PASS_PRICE = 29900;

export const actions: Actions = {
  createPaymentIntent: async (event) => {
    const session = await event.locals.auth();
    if (!session?.user?.id) {
      return fail(401, { error: 'Unauthorized' });
    }

    if (!checkRateLimit(`pass_payment:${session.user.id}`, 5, 60000)) {
      return fail(429, { error: 'Too many attempts. Please wait.' });
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: LEARNER_PASS_PRICE,
        currency: 'php',
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: session.user.id,
          product: 'learner_pass_30d',
        },
      });

      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      return fail(500, { error: 'Failed to create payment intent' });
    }
  },

  confirmPayment: async (event) => {
    const session = await event.locals.auth();
    if (!session?.user?.id) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await event.request.formData();
    const paymentIntentId = formData.get('paymentIntentId') as string;

    if (!paymentIntentId) {
      return fail(400, { error: 'Missing paymentIntentId' });
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return fail(400, { error: 'Payment not succeeded' });
      }

      const metadata = paymentIntent.metadata as { product?: string; userId?: string };

      if (metadata?.product === 'learner_pass_30d' && metadata?.userId === session.user.id) {
        const existing = await prisma.learner_pass_enrollment.findFirst({
          where: { payment_id: paymentIntentId },
          select: { id: true },
        });

        const confirmation = getLearnerPassConfirmationResult({
          paymentSucceeded: true,
          existingEnrollment: existing,
        });

        if (!confirmation.success) {
          return fail(400, { error: confirmation.error });
        }

        if (confirmation.status === 'pending_webhook') {
          return { success: true, status: 'pending_webhook', message: confirmation.message };
        }

        return { success: true, enrollment: existing, status: 'active' };
      }

      return fail(400, { error: 'Invalid payment metadata' });
    } catch (error) {
      return fail(500, { error: 'Failed to confirm payment' });
    }
  },
};
