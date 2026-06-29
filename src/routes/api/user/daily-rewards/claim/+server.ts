import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import { detectNewlyUnlockedAchievements } from '$lib/server/achievements/unlocks';

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

/** Maps a claim timestamp to the daily-reward day index (0=Mon … 6=Sun). */
function dayIndexFromDate(d: Date | string): number {
  const date = typeof d === 'string' ? new Date(d) : d;
  const jsDay = date.getDay(); // 0=Sun, 1=Mon, …, 6=Sat
  return jsDay === 0 ? 6 : jsDay - 1;
}

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  const userId = session.user.id;

  const body = await event.request.json().catch(() => null);
  const dayIndex = body?.dayIndex;

  if (typeof dayIndex !== 'number' || dayIndex < 0 || dayIndex > 6) {
    throw error(400, 'Invalid day index');
  }

  const dayNumber = dayIndex + 1;

  try {
    const result = await prisma.$transaction(async (tx) => {
      let daily = await tx.daily_login.findUnique({
        where: { user_id: userId }
      });

      const now = new Date();

      if (!daily) {
        daily = await tx.daily_login.create({
          data: {
            user_id: userId,
            date: now,
            streak: 1,
            currentDay: 2,
            claimedDays: [now],
            lastClaimedAt: now,
          }
        });
      } else {
        if (daily.lastClaimedAt) {
          const timeSinceLast = now.getTime() - daily.lastClaimedAt.getTime();
          if (timeSinceLast < ONE_DAY_MS) {
            const remainingMs = ONE_DAY_MS - timeSinceLast;
            const hours = Math.floor(remainingMs / (1000 * 60 * 60));
            const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
            throw error(429, `Please wait ${hours}h ${minutes}m before next claim`);
          }
        }

        if (dayIndex >= daily.currentDay) {
          throw error(400, 'Reward not yet available — claim previous days first');
        }

        if (daily.claimedDays.some((d) => dayIndexFromDate(d) === dayIndex)) {
          throw error(400, 'Reward already claimed');
        }

        const newClaimed = [...daily.claimedDays, now];
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

      const reward = REWARD_SCHEDULE[dayIndex];
      if (!reward) {
        throw error(500, 'Invalid reward schedule');
      }

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

    const newlyUnlocked = await detectNewlyUnlockedAchievements(userId);

    return Response.json({
      success: true,
      day: dayNumber,
      coins: result.reward.coins,
      xp: result.reward.xp,
      newCoins: result.updatedUser.coins,
      newXp: result.updatedUser.xp,
      currentDay: result.daily.currentDay,
      claimedDays: result.daily.claimedDays.map(dayIndexFromDate),
      canClaimToday: false,
      nextAvailableAt: new Date(Date.now() + ONE_DAY_MS).toISOString(),
      cooldown: {
        remainingMs: ONE_DAY_MS,
        hours: 24,
        minutes: 0,
      },
      newlyUnlocked,
    });
  } catch (err) {
    console.error('Error claiming daily reward:', err);
    if (err instanceof Error && err.message.includes('Please wait')) {
      throw error(429, err.message);
    }
    if (err instanceof Error && err.message.includes('already claimed')) {
      throw error(409, 'Reward already claimed');
    }
    throw error(500, 'Failed to claim reward');
  }
};
