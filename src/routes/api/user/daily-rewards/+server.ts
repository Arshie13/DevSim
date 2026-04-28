import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const GET: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  try {
    const dailyLogin = await prisma.daily_login.findUnique({
      where: { user_id: session.user.id },
      select: { currentDay: true, claimedDays: true, streak: true, lastClaimedAt: true }
    });

    if (!dailyLogin) {
      return Response.json({
        currentDay: 1,
        claimedDays: [],
        streak: 0,
        hasRewards: true,
        canClaimToday: true,
        nextAvailableAt: null,
      });
    }

    // Compute cooldown
    const now = Date.now();
    const lastClaimTime = dailyLogin.lastClaimedAt?.getTime() || 0;
    const timeSinceLast = now - lastClaimTime;
    const remainingMs = Math.max(0, ONE_DAY_MS - timeSinceLast);
    const canClaimToday = timeSinceLast >= ONE_DAY_MS;

    // Parse remaining time
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    return Response.json({
      currentDay: dailyLogin.currentDay,
      claimedDays: dailyLogin.claimedDays,
      streak: dailyLogin.streak,
      lastClaimedAt: dailyLogin.lastClaimedAt,
      hasRewards: dailyLogin.currentDay <= 7,
      canClaimToday,
      nextAvailableAt: canClaimToday ? null : new Date(now + remainingMs).toISOString(),
      cooldown: {
        remainingMs,
        hours,
        minutes,
      },
    });
  } catch (err) {
    console.error('Error fetching daily rewards:', err);
    throw error(500, 'Failed to fetch daily rewards');
  }
};
