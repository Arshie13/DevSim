import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import prisma from '$lib/server/client';
import Stripe from 'stripe';
import { checkRateLimit } from '$lib/server/ratelimit';
import { getCoinPurchaseConfirmationResult } from '$lib/server/learnerPass';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const COIN_PRICE_CENTAVOS = 50;

const PACKAGES_PRICES: Record<string, { amount: number; price: number }> = {
  starter: { amount: 500, price: 24900 },
  pro:     { amount: 2000, price: 74900 },
  elite:   { amount: 5000, price: 149900 },
  omega:   { amount: 15000, price: 399900 },
};

const PACKAGES: Record<string, { name: string; amount: number; price: string }> = {
  starter: { name: 'Starter Pouch', amount: 500, price: '₱249.00' },
  pro:     { name: 'Pro Hoard', amount: 2000, price: '₱749.00' },
  elite:   { name: 'Elite Vault', amount: 5000, price: '₱1,499.00' },
  omega:   { name: 'Omega Nexus', amount: 15000, price: '₱3,999.00' },
};

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw redirect(303, '/');
  }

  const packageId = event.url.searchParams.get('packageId');
  const amountParam = event.url.searchParams.get('amount');

  let product = null;

  if (packageId && PACKAGES[packageId]) {
    product = {
      id: packageId,
      ...PACKAGES[packageId]
    };
  } else if (amountParam) {
    const amount = parseInt(amountParam);
    if (!isNaN(amount) && amount >= 100) {
      product = {
        id: 'custom',
        name: 'Custom Data Injection',
        amount: amount,
        price: `₱${(amount * 0.50).toFixed(2)}`
      };
    }
  }

  if (!product) {
    throw redirect(303, '/marketplace/coins');
  }

  return {
    user: session.user,
    product
  };
};

export const actions: Actions = {
  createPaymentIntent: async (event) => {
    const session = await event.locals.auth();
    if (!session?.user?.id) {
      return fail(401, { error: 'Unauthorized' });
    }

    if (!checkRateLimit(`coin_payment:${session.user.id}`, 5, 60000)) {
      return fail(429, { error: 'Too many attempts. Please wait.' });
    }

    try {
      const formData = await event.request.formData();
      const packageId = formData.get('packageId') as string | null;
      const customAmountStr = formData.get('customAmount') as string | null;
      const customAmount = customAmountStr ? parseInt(customAmountStr) : null;

      let finalAmountCentavos = 0;
      let coinAmount = 0;

      if (packageId && PACKAGES_PRICES[packageId]) {
        const pkg = PACKAGES_PRICES[packageId];
        finalAmountCentavos = pkg.price;
        coinAmount = pkg.amount;
      } else if (customAmount && !isNaN(customAmount) && customAmount >= 100) {
        coinAmount = customAmount;
        finalAmountCentavos = customAmount * COIN_PRICE_CENTAVOS;
      } else {
        return fail(400, { error: 'Invalid package or amount' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: finalAmountCentavos,
        currency: 'php',
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: session.user.id,
          coinAmount: coinAmount.toString(),
          type: 'coin_purchase',
        },
      });

      return { clientSecret: paymentIntent.client_secret, amount: finalAmountCentavos };
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

      const metadata = paymentIntent.metadata as { coinAmount?: string; userId?: string; type?: string };

      if (metadata?.type === 'coin_purchase' && metadata?.userId === session.user.id && metadata?.coinAmount) {
        const existing = await prisma.coin_purchase.findUnique({
          where: { payment_id: paymentIntentId },
          select: { id: true },
        });

        const confirmation = getCoinPurchaseConfirmationResult({
          paymentSucceeded: true,
          existingPurchase: existing,
        });

        if (!confirmation.success) {
          return fail(400, { error: confirmation.error });
        }

        if (confirmation.status === 'pending_webhook') {
          return {
            success: true,
            status: 'pending_webhook',
            message: confirmation.message,
          };
        }

        return {
          success: true,
          status: 'active',
          message: 'Your coins are already credited.',
        };
      }

      return fail(400, { error: 'Invalid payment metadata' });
    } catch (err: any) {
      // ponytail: P2002 = duplicate payment_id, already processed
      if (err?.code === 'P2002') return { success: true, added: 0 };
      return fail(500, { error: 'Failed to confirm purchase' });
    }
  },
};
