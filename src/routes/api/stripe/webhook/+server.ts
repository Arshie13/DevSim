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
        const existingEnrollment = await prisma.learner_pass_enrollment.findFirst({
          where: { payment_id: paymentIntent.id },
        });

        if (existingEnrollment) {
          console.log(`Enrollment already exists for payment ${paymentIntent.id}`);
        } else {
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
        }
      } catch (err) {
        console.error("Failed to activate learner pass:", err);
      }
    }
  }

  return json({ received: true });
};