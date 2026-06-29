import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import Stripe from "stripe";
import {
  ensureLearnerPassEnrollmentForPayment,
  ensureCoinPurchaseForPayment,
} from "$lib/server/learnerPass";

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
        const { created } = await ensureLearnerPassEnrollmentForPayment({
          userId: metadata.userId,
          paymentId: paymentIntent.id,
        });

        if (created) {
          console.log(`Learner pass activated for user ${metadata.userId}`);
        } else {
          console.log(`Enrollment already exists for payment ${paymentIntent.id}`);
        }
      } catch (err) {
        console.error("Failed to activate learner pass:", err);
        return json({ error: "Failed to activate learner pass" }, { status: 500 });
      }
    } else if (metadata?.type === "coin_purchase" && metadata?.userId && metadata?.coinAmount) {
      const coinAmount = parseInt(metadata.coinAmount, 10);
      if (Number.isNaN(coinAmount) || coinAmount <= 0) {
        console.error("Invalid coin amount in webhook metadata:", metadata.coinAmount);
      } else {
        try {
          const { created } = await ensureCoinPurchaseForPayment({
            userId: metadata.userId,
            paymentId: paymentIntent.id,
            coinAmount,
          });

          if (created) {
            console.log(`Coin purchase credited for user ${metadata.userId}: ${coinAmount} coins`);
          } else {
            console.log(`Coin purchase already processed for payment ${paymentIntent.id}`);
          }
        } catch (err) {
          console.error("Failed to credit coins:", err);
          return json({ error: "Failed to credit coins" }, { status: 500 });
        }
      }
    }
  }

  return json({ received: true });
};
