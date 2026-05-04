import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';

// Reward schedule matching frontend
const REWARD_SCHEDULE = [
  { day: 1, coins: 50,  xp: 10 },
  { day: 2, coins: 75,  xp: 20 },
  { day: 3, coins: 100, xp: 30 },
  { day: 4, coins: 150, xp: 40 },
  { day: 5, coins: 200, xp: 50 },
  { day: 6, coins: 300, xp: 75 },
  { day: 7, coins: 500, xp: 100 },
];

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  const userId = session.user.id;

  // Parse body: { dayIndex: number } (0-based index)
  const body = await event.request.json().catch(() => null);
  const dayIndex = body?.dayIndex;

  if (typeof dayIndex !== 'number' || dayIndex < 0 || dayIndex > 6) {
    throw error(400, 'Invalid day index');
  }

  const dayNumber = dayIndex + 1; // Convert to 1-based for display

  try {
    // Use a transaction to ensure atomic update
    const result = await prisma.$transaction(async (tx) => {
      // Find or create daily_login record
      let daily = await tx.daily_login.findUnique({
        where: { user_id: userId }
      });

      const now = new Date();

      if (!daily) {
        // First-time claim: no previous record, allow immediately
        daily = await tx.daily_login.create({
          data: {
            user_id: userId,
            date: now,
            streak: 1,
            currentDay: 2,
            claimedDays: [dayIndex],
            lastClaimedAt: now,
          }
        });
      } else {
        // ── Time-based validation: at least 24h since last claim ──
        if (daily.lastClaimedAt) {
          const timeSinceLast = now.getTime() - daily.lastClaimedAt.getTime();
          if (timeSinceLast < ONE_DAY_MS) {
            const remainingMs = ONE_DAY_MS - timeSinceLast;
            const hours = Math.floor(remainingMs / (1000 * 60 * 60));
            const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
            throw error(429, `Please wait ${hours}h ${minutes}m before next claim`);
          }
        }

        // ── Sequential validation: must claim in order ──
        if (dayIndex >= daily.currentDay) {
          throw error(400, 'Reward not yet available — claim previous days first');
        }

        // ── Duplicate claim check ──
        if (daily.claimedDays.includes(dayIndex)) {
          throw error(400, 'Reward already claimed');
        }

        // ── Update state ──
        const newClaimed = [...daily.claimedDays, dayIndex];
        const nextCurrentDay = Math.max(daily.currentDay, dayIndex + 2);
        const newStreak = daily.streak + 1;

        daily = await tx.daily_login.update({
          where: { user_id: userId },
          data: {
            claimedDays: newClaimed,
            currentDay: nextCurrentDay,
            streak: newStreak,
            lastClaimedAt: now,
          }
        });
      }

      // Get reward amounts
      const reward = REWARD_SCHEDULE[dayIndex];
      if (!reward) {
        throw error(500, 'Invalid reward schedule');
      }

      // Update user coins and XP in same transaction
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: reward.coins },
          xp: { increment: reward.xp },
        },
        select: { coins: true, xp: true }
      });

      return { daily, updatedUser, reward };
    });

    return Response.json({
      success: true,
      day: dayNumber,
      coins: result.reward.coins,
      xp: result.reward.xp,
      newCoins: result.updatedUser.coins,
      newXp: result.updatedUser.xp,
      currentDay: result.daily.currentDay,
      claimedDays: result.daily.claimedDays,
      canClaimToday: false,
      nextAvailableAt: new Date(Date.now() + ONE_DAY_MS).toISOString(),
      cooldown: {
        remainingMs: ONE_DAY_MS,
        hours: 24,
        minutes: 0,
      },
    });
  } catch (err) {
    console.error('Error claiming daily reward:', err);
    // Propagate specific errors with proper status
    if (err instanceof Error && err.message.includes('Please wait')) {
      throw error(429, err.message);
    }
    if (err instanceof Error && err.message.includes('already claimed')) {
      throw error(409, 'Reward already claimed');
    }
    throw error(500, 'Failed to claim reward');
  }
};
