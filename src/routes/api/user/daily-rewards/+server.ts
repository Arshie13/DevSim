import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const REWARD_SCHEDULE = [
  { day: 1, coins: 50, xp: 10, aiHelps: 1 },
  { day: 2, coins: 75, xp: 20, aiHelps: 1 },
  { day: 3, coins: 100, xp: 30, aiHelps: 2 },
  { day: 4, coins: 150, xp: 40, aiHelps: 2 },
  { day: 5, coins: 200, xp: 50, aiHelps: 2 },
  { day: 6, coins: 300, xp: 75, aiHelps: 3 },
  { day: 7, coins: 500, xp: 100, aiHelps: 5 },
];

export const GET: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  try {
    const dailyLogin = await prisma.daily_login.findUnique({
      where: { user_id: session.user.id },
      select: {
        streak: true,
        last_claimed_at: true,
        claims: { select: { day_index: true } },
      },
    });

    if (!dailyLogin) {
      return Response.json({
        currentDay: 1,
        claimedDays: [],
        streak: 0,
        hasRewards: true,
        canClaimToday: true,
        nextAvailableAt: null,
        rewards: REWARD_SCHEDULE,
      });
    }

    const now = Date.now();
    const lastClaimTime = dailyLogin.last_claimed_at?.getTime() ?? 0;
    const timeSinceLast = now - lastClaimTime;
    const remainingMs = Math.max(0, ONE_DAY_MS - timeSinceLast);
    const canClaimToday = timeSinceLast >= ONE_DAY_MS;

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    // Derive the next claimable day from the highest claimed day_index.
    // day_index is 0-based, so highest + 2 gives the next 1-based day number.
    const highestClaimed = dailyLogin.claims.reduce(
      (max, c) => Math.max(max, c.day_index),
      -1,
    );
    const nextClaimableDay = highestClaimed + 2; // e.g. 0 claimed → day 2 next

    return Response.json({
      currentDay: nextClaimableDay,
      claimedDays: dailyLogin.claims.map((c) => c.day_index),
      streak: dailyLogin.streak,
      lastClaimedAt: dailyLogin.last_claimed_at,
      hasRewards: nextClaimableDay <= REWARD_SCHEDULE.length + 1,
      canClaimToday,
      nextAvailableAt: canClaimToday ? null : new Date(now + remainingMs).toISOString(),
      cooldown: { remainingMs, hours, minutes },
      rewards: REWARD_SCHEDULE,
    });
  } catch (err) {
    console.error('Error fetching daily rewards:', err);
    throw error(500, 'Failed to fetch daily rewards');
  }
};
