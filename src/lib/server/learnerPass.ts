import prisma from '$lib/server/client';

export type PaymentConfirmationStatus = 'active' | 'pending_webhook';

export interface PaymentConfirmationResult {
  success: boolean;
  status?: PaymentConfirmationStatus;
  enrollment?: {
    id: string;
    user_id: string;
    status: string;
    started_at: Date | null;
    expires_at: Date | null;
    payment_id: string | null;
  } | null;
  message?: string;
  error?: string;
}

export async function ensureLearnerPassEnrollmentForPayment({
  userId,
  paymentId,
  paymentProvider = 'stripe',
}: {
  userId: string;
  paymentId: string;
  paymentProvider?: string;
}) {
  const existing = await prisma.learner_pass_enrollment.findFirst({
    where: { payment_id: paymentId },
    select: {
      id: true,
      user_id: true,
      started_at: true,
      expires_at: true,
      payment_id: true,
    },
  });

  if (existing) {
    return { enrollment: existing, created: false };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  try {
    const enrollment = await prisma.learner_pass_enrollment.create({
      data: {
        user_id: userId,
        started_at: now,
        expires_at: expiresAt,
        streak: 0,
        payment_id: paymentId,
        payment_provider: paymentProvider,
      },
      select: {
        id: true,
        user_id: true,
        started_at: true,
        expires_at: true,
        payment_id: true,
      },
    });

    return { enrollment, created: true };
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      const existingAfterCreate = await prisma.learner_pass_enrollment.findFirst({
        where: { payment_id: paymentId },
        select: {
          id: true,
          user_id: true,
          started_at: true,
          expires_at: true,
          payment_id: true,
        },
      });

      return { enrollment: existingAfterCreate, created: false };
    }

    throw error;
  }
}

export async function ensureCoinPurchaseForPayment({
  userId,
  paymentId,
  coinAmount,
}: {
  userId: string;
  paymentId: string;
  coinAmount: number;
}) {
  const existing = await prisma.coin_purchase.findUnique({
    where: { payment_id: paymentId },
    select: {
      id: true,
      user_id: true,
      payment_id: true,
      coin_amount: true,
    },
  });

  if (existing) {
    return { purchase: existing, created: false };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.coin_purchase.create({
        data: {
          user_id: userId,
          payment_id: paymentId,
          coin_amount: coinAmount,
        },
        select: {
          id: true,
          user_id: true,
          payment_id: true,
          coin_amount: true,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: coinAmount },
        },
      });

      return { purchase, updatedUser };
    });

    return { purchase: result.purchase, created: true };
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      const existingAfterCreate = await prisma.coin_purchase.findUnique({
        where: { payment_id: paymentId },
        select: {
          id: true,
          user_id: true,
          payment_id: true,
          coin_amount: true,
        },
      });

      return { purchase: existingAfterCreate, created: false };
    }

    throw error;
  }
}

export function getLearnerPassConfirmationResult({
  paymentSucceeded,
  existingEnrollment,
}: {
  paymentSucceeded: boolean;
  existingEnrollment: { id: string } | null;
}): PaymentConfirmationResult {
  if (!paymentSucceeded) {
    return {
      success: false,
      error: 'Payment not succeeded',
    };
  }

  if (existingEnrollment) {
    return {
      success: true,
      status: 'active',
      enrollment: existingEnrollment as PaymentConfirmationResult['enrollment'],
    };
  }

  return {
    success: true,
    status: 'pending_webhook',
    message: 'Payment confirmed. Your learner pass will be activated shortly.',
  };
}

export function getCoinPurchaseConfirmationResult({
  paymentSucceeded,
  existingPurchase,
}: {
  paymentSucceeded: boolean;
  existingPurchase: { id: string } | null;
}): PaymentConfirmationResult {
  if (!paymentSucceeded) {
    return {
      success: false,
      error: 'Payment not succeeded',
    };
  }

  if (existingPurchase) {
    return {
      success: true,
      status: 'active',
    };
  }

  return {
    success: true,
    status: 'pending_webhook',
    message: 'Payment confirmed. Your coins will be added shortly.',
  };
}
