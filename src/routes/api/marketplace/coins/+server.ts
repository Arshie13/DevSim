import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const COIN_PRICE_CENTAVOS = 50; 

const PACKAGES = {
  "starter": { amount: 500, price: 24900 }, 
  "pro":     { amount: 2000, price: 74900 }, 
  "elite":   { amount: 5000, price: 149900 }, 
  "omega":   { amount: 15000, price: 399900 }, 
};

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    return json({ status: 401, error: "Unauthorized" });
  }

  try {
    const { packageId, customAmount } = await event.request.json();

    let finalAmountCentavos = 0;
    let coinAmount = 0;

    if (packageId && PACKAGES[packageId as keyof typeof PACKAGES]) {
      const pkg = PACKAGES[packageId as keyof typeof PACKAGES];
      finalAmountCentavos = pkg.price;
      coinAmount = pkg.amount;
    } else if (customAmount && typeof customAmount === "number" && customAmount >= 100) {
      coinAmount = customAmount;
      finalAmountCentavos = customAmount * COIN_PRICE_CENTAVOS;
    } else {
      return json({ status: 400, error: "Invalid package or amount" });
    }

    const metadata: Record<string, string> = {
      userId: session.user.id,
      coinAmount: coinAmount.toString(),
      type: "coin_purchase"
    };

    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmountCentavos,
      currency: "php",
      automatic_payment_methods: { enabled: true },
      metadata,
    });

    return json({ clientSecret: paymentIntent.client_secret, amount: finalAmountCentavos });
  } catch (error) {
    console.error("Coin purchase POST error:", error);
    return json({ status: 500, error: "Failed to create payment intent" });
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

    const metadata = paymentIntent.metadata as { coinAmount?: string; userId?: string; type?: string };

    if (metadata?.type === "coin_purchase" && metadata?.userId === session.user.id && metadata?.coinAmount) {
      const coinAmount = parseInt(metadata.coinAmount);

      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          coins: { increment: coinAmount }
        }
      });

      return json({ success: true, newTotal: updatedUser.coins, added: coinAmount });
    }

    return json({ status: 400, error: "Invalid payment metadata" });
  } catch (error) {
    console.error("Coin purchase PUT error:", error);
    return json({ status: 500, error: "Failed to confirm purchase" });
  }
};
