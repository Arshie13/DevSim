import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import Stripe from 'stripe';
import { checkRateLimit } from '$lib/server/ratelimit';
import { ensureLearnerPassEnrollmentForPayment, getLearnerPassConfirmationResult } from '$lib/server/learnerPass';
import { hasActiveLearnerPass } from '$lib/server/access/hasProjectAccess';
import prisma from '$lib/server/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const LEARNER_PASS_PRICE = 29900;

const ALREADY_HAS_PASS_ERROR =
  'You already have an active Learner Pass. You can buy another one once it expires.';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    return { alreadyHasPass: false, expiresAt: null };
  }

  const active = await hasActiveLearnerPass(session.user.id);

  let expiresAt: string | null = null;
  if (active) {
    const enrollment = await prisma.learner_pass_enrollment.findFirst({
      where: { user_id: session.user.id },
      orderBy: { created_at: 'desc' },
      select: { expires_at: true },
    });
    expiresAt = enrollment?.expires_at?.toISOString() ?? null;
  }

  return { alreadyHasPass: active, expiresAt };
};

/**
 * A pass conflicts with starting a new purchase unless the given payment was
 * already linked to an enrollment (idempotent re-confirm of the same payment).
 */
async function hasConflictingActivePass(userId: string, paymentId: string): Promise<boolean> {
  const enrollmentForThisPayment = await prisma.learner_pass_enrollment.findUnique({
    where: { payment_id: paymentId },
    select: { id: true },
  });

  if (enrollmentForThisPayment) return false;

  return hasActiveLearnerPass(userId);
}

export const actions: Actions = {
  createPaymentIntent: async (event) => {
    const session = await event.locals.auth();
    if (!session?.user?.id) {
      return fail(401, { error: 'Unauthorized' });
    }

    if (!checkRateLimit(`pass_payment:${session.user.id}`, 5, 60000)) {
      return fail(429, { error: 'Too many attempts. Please wait.' });
    }

    if (await hasActiveLearnerPass(session.user.id)) {
      return fail(400, { error: ALREADY_HAS_PASS_ERROR });
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

    if (await hasConflictingActivePass(session.user.id, paymentIntentId)) {
      return fail(400, { error: ALREADY_HAS_PASS_ERROR });
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return fail(400, { error: 'Payment not succeeded' });
      }

      const metadata = paymentIntent.metadata as { product?: string; userId?: string };

      if (metadata?.product === 'learner_pass_30d' && metadata?.userId === session.user.id) {
        const { enrollment } = await ensureLearnerPassEnrollmentForPayment({
          userId: session.user.id,
          paymentId: paymentIntentId,
        });

        const confirmation = getLearnerPassConfirmationResult({
          paymentSucceeded: true,
          existingEnrollment: enrollment,
        });

        if (!confirmation.success) {
          return fail(400, { error: confirmation.error });
        }

        if (confirmation.status === 'pending_webhook') {
          return { success: true, status: 'pending_webhook', message: confirmation.message };
        }

        return { success: true, enrollment, status: 'active' };
      }

      return fail(400, { error: 'Invalid payment metadata' });
    } catch (error) {
      return fail(500, { error: 'Failed to confirm payment' });
    }
  },
};
