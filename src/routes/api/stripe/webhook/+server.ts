import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const POST: RequestHandler = async (event) => {
  const body = await event.request.text();
  const signature = event.request.headers.get("stripe-signature");

  if (!signature) {
    return json({ error: "Missing signature" }, { status: 400 });
  }

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      endpointSecret,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return json({ error: "Invalid signature" }, { status: 400 });
  }

  if (stripeEvent.type === "payment_intent.succeeded") {
    const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent;
    const metadata = paymentIntent.metadata;

    if (metadata?.product === "learner_pass_30d" && metadata?.userId) {
      try {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        await prisma.learner_pass_enrollment.create({
          data: {
            user_id: metadata.userId,
            status: "ACTIVE",
            started_at: now,
            expires_at: expiresAt,
            current_day: 1,
            streak: 0,
            total_claimed_days: 0,
            payment_id: paymentIntent.id,
            payment_provider: "stripe",
          },
        });

        console.log(`Learner pass activated for user ${metadata.userId}`);
      } catch (err) {
        // P2002 = unique constraint violation — duplicate, safe to ignore
        if ((err as any)?.code === "P2002") {
          console.log(`Enrollment already exists for payment ${paymentIntent.id}`);
        } else {
          console.error("Failed to activate learner pass:", err);
          return json({ error: "Failed to activate learner pass" }, { status: 500 });
        }
      }
    }

    if (metadata?.type === "sandbox_purchase" && metadata?.userId) {
      try {
        const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

        await prisma.sandbox_access.upsert({
          where: { user_id: metadata.userId },
          update: { payment_id: paymentIntent.id, expires_at: expiresAt },
          create: {
            user_id: metadata.userId,
            payment_id: paymentIntent.id,
            expires_at: expiresAt,
          },
        });

        console.log(`Sandbox access granted for user ${metadata.userId}`);
      } catch (err) {
        console.error("Failed to grant sandbox access:", err);
        return json({ error: "Failed to grant sandbox access" }, { status: 500 });
      }
    }
  }

  return json({ received: true });
};