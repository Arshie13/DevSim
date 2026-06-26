import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const SANDBOX_PRICE_CENTAVOS = 19900;

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    return json({ status: 401, error: "Unauthorized" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: SANDBOX_PRICE_CENTAVOS,
      currency: "php",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: session.user.id,
        type: "sandbox_purchase",
      },
    });

    return json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Sandbox payment POST error:", error);
    return json({ status: 500, error: "Failed to create payment intent" });
  }
};
