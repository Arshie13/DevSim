import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const LEARNER_PASS_PRICE = 29900; // ₱299.00 in centavos

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    return json({ status: 401, error: "Unauthorized" });
  }

  try {
    let { amount, product } = await event.request.json();

    const metadata: Record<string, string> = {
      userId: session.user.id,
    };

    if (product === "learner_pass_30d") {
      amount = LEARNER_PASS_PRICE;
      metadata.product = product;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "php",
      automatic_payment_methods: { enabled: true },
      metadata,
    });

    return json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return json({ status: 500, error: error });
  }
};

export const PUT: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    return json({ status: 401, error: "Unauthorized" });
  }

  const { paymentIntentId } = await event.request.json();

  if (!paymentIntentId) {
    return json({ status: 400, error: "Missing paymentIntentId" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return json({ status: 400, error: "Payment not succeeded" });
    }

    const metadata = paymentIntent.metadata as { product?: string; userId?: string };

    if (metadata?.product === "learner_pass_30d" && metadata?.userId === session.user.id) {
      // Try webhook-created enrollment first.
      const existing = await prisma.learner_pass_enrollment.findFirst({
        where: { payment_id: paymentIntentId },
      });
      if (existing) return json({ success: true, enrollment: existing });

      // Fallback: create enrollment directly.
      // Unique constraint on payment_id prevents double-claim if webhook
      // fires concurrently.
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const enrollment = await prisma.learner_pass_enrollment.create({
        data: {
          user_id: metadata.userId!,
          status: "ACTIVE",
          started_at: now,
          expires_at: expiresAt,
          current_day: 1,
          streak: 0,
          total_claimed_days: 0,
          payment_id: paymentIntentId,
          payment_provider: "stripe",
        },
      });

      return json({ success: true, enrollment });
    }

    return json({ status: 400, error: "Invalid payment metadata" });
  } catch (error) {
    return json({ status: 500, error: error });
  }
};
