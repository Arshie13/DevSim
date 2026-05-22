import prisma from '$lib/server/client';

export type PaymentProvider = 'stripe' | 'gcash' | 'paymongo';

export class PremiumPassService {
  async createCheckoutSession(userId: string, seasonId: string, provider: PaymentProvider) {
    // For MVP, we only implement Stripe
    if (provider !== 'stripe') {
      throw new Error('Only Stripe is supported in MVP');
    }

    const season = await prisma.season.findUnique({
      where: { id: seasonId }
    });

    if (!season) throw new Error('Season not found');

    // Price ID from env — should be configured in admin settings or env
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) throw new Error('Stripe price ID not configured');

    // Import Stripe
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pass?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pass?canceled=true`,
      metadata: {
        userId,
        seasonId
      },
    });

    return { checkoutUrl: checkoutSession.url };
  }

  async handleStripeWebhook(payload: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('Stripe webhook secret not configured');

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      throw new Error(`Webhook error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      const seasonId = session.metadata?.seasonId;
      const paymentId = session.id;

      if (!userId || !seasonId) {
        console.error('Missing metadata in checkout session', session.id);
        return;
      }

      await this.grantPremiumAccess(userId, seasonId, paymentId, 'stripe');
    }
  }

  async grantPremiumAccess(
    userId: string,
    seasonId: string,
    paymentId: string,
    provider: PaymentProvider
  ) {
    const season = await prisma.season.findUnique({
      where: { id: seasonId }
    });

    if (!season) throw new Error('Season not found');

    // Calculate expiry: 60 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    // Upsert (in case of duplicate webhook)
    const existing = await prisma.user_premium_pass.findFirst({
      where: { user_id: userId, season_id: seasonId }
    });

    if (existing) {
      await prisma.user_premium_pass.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          expiresAt,
          paymentId,
          paymentProvider: provider
        }
      });
    } else {
      await prisma.user_premium_pass.create({
        data: {
          user_id: userId,
          season_id: seasonId,
          expiresAt,
          isActive: true,
          paymentId,
          paymentProvider: provider
        }
      });
    }

    // Also update quick-access field on user table
    await prisma.user.update({
      where: { id: userId },
      data: { premiumPassExpiresAt: expiresAt }
    });
  }

  async revokePremiumAccess(userId: string, seasonId: string, reason?: string) {
    await prisma.user_premium_pass.updateMany({
      where: {
        user_id: userId,
        season_id: seasonId
      },
      data: { isActive: false }
    });

    // Clear quick-access field if it matches this season's expiry
    await prisma.user.update({
      where: { id: userId },
      data: { premiumPassExpiresAt: null }
    });
  }

  async isUserPremium(userId: string, seasonId?: string): Promise<boolean> {
    const where: any = seasonId
      ? { user_id: userId, season_id: seasonId }
      : { user_id: userId };

    const pass = await prisma.user_premium_pass.findFirst({
      where: { ...where, isActive: true }
    });

    if (!pass) return false;

    const now = new Date();
    return pass.expiresAt > now;
  }

  async getUserPremiumStatus(userId: string) {
    const pass = await prisma.user_premium_pass.findFirst({
      where: { user_id: userId, isActive: true },
      orderBy: { purchasedAt: 'desc' },
      include: {
        season: {
          select: { id: true, name: true, slug: true, endDate: true }
        }
      }
    });

    if (!pass) return { hasPremium: false, expiresAt: null, season: null };

    const now = new Date();
    const isActive = pass.expiresAt > now;

    return {
      hasPremium: isActive,
      expiresAt: pass.expiresAt,
      season: {
        id: pass.season.id,
        name: pass.season.name,
        slug: pass.season.slug,
        endDate: pass.season.endDate
      }
    };
  }
}
