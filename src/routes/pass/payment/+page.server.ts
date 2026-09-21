import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import Stripe from 'stripe';
import { checkRateLimit } from '$lib/server/ratelimit';
import { ensureLearnerPassEnrollmentForPayment, getLearnerPassConfirmationResult } from '$lib/server/learnerPass';
import prisma from '$lib/server/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const LEARNER_PASS_PRICE = 29900;

// The shared Header needs live account data (coins, xp, avatars, …) that the
// auth session does not carry — fetch it here so the page can build its
// userData. Pattern mirrors dashboard/+page.server.ts. Payment logic below is
// untouched.
export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  const userData = session?.user;

  if (!userData || !userData.id) {
    throw redirect(303, '/');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userData.id },
    select: {
      name: true,
      email: true,
      image: true,
      coins: true,
      xp: true,
      has_seen_dashboard_onboarding: true,
      owned_avatars: true,
      has_completed_tutorial: true,
    },
  });

  return {
    user: {
      ...session.user,
      name: dbUser?.name ?? userData.name ?? 'No Name',
      email: dbUser?.email ?? userData.email ?? '',
      image: dbUser?.image ?? userData.image ?? undefined,
      // The user table has no avatar column — the image path is the avatar
      // (same derivation as dashboard/+page.svelte's headerUserData).
      avatar: dbUser?.image ?? userData.image ?? '',
      coins: dbUser?.coins ?? 0,
      xp: dbUser?.xp ?? 0,
      // The user table has no level column; 1 is the platform-wide default
      // (see the /leaderboards server load).
      level: 1,
      ownedAvatars: dbUser?.owned_avatars ?? [],
      hasSeenDashboardOnboarding: dbUser?.has_seen_dashboard_onboarding ?? false,
      hasCompletedTutorial: dbUser?.has_completed_tutorial ?? false,
    },
  };
};

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
