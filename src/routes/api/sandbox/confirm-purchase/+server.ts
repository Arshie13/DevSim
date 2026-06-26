import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

    const metadata = paymentIntent.metadata as { type?: string; userId?: string };

    if (metadata?.type === "sandbox_purchase" && metadata?.userId === session.user.id) {
      const existing = await prisma.sandbox_access.findUnique({
        where: { user_id: session.user.id }
      });

      if (existing) return json({ success: true });

      const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      await prisma.sandbox_access.create({
        data: {
          user_id: session.user.id,
          payment_id: paymentIntentId,
          expires_at: expiresAt,
        },
      });

      return json({ success: true });
    }

    return json({ status: 400, error: "Invalid payment metadata" });
  } catch (error) {
    console.error("Sandbox confirm PUT error:", error);
    return json({ status: 500, error: "Failed to confirm purchase" });
  }
};
