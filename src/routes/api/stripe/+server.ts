import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";
import Stripe from "stripe";

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  if (!session?.user?.id) {
    return json({ status: 401, error: "Unauthorized" });
  }

  try {
    let { amount } = await event.request.json();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "php",
      automatic_payment_methods: { enabled: true }
    });

    return json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return json({ status: 500, error: error });
  }
};
