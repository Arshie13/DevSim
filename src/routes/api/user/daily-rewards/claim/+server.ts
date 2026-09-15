import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import { detectNewlyUnlockedAchievements } from '$lib/server/achievements/unlocks';

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
        where: { user_id: userId },
        include: { claims: { select: { day_index: true } } },
      });

      const now = new Date();

      if (!daily) {
        // First-ever claim: create the daily_login row and the first claim.
        daily = await tx.daily_login.create({
          data: {
            user_id: userId,
            streak: 1,
            last_claimed_at: now,
            claims: { create: { day_index: dayIndex } },
          },
          include: { claims: { select: { day_index: true } } },
        });
      } else {
        // 24-hour cooldown guard.
        if (daily.last_claimed_at) {
          const timeSinceLast = now.getTime() - daily.last_claimed_at.getTime();
          if (timeSinceLast < ONE_DAY_MS) {
            const remainingMs = ONE_DAY_MS - timeSinceLast;
            const hours = Math.floor(remainingMs / (1000 * 60 * 60));
            const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
            throw error(429, `Please wait ${hours}h ${minutes}m before next claim`);
          }
        }

        // Derive which day is next claimable from the highest claimed day_index.
        const highestClaimed = daily.claims.reduce(
          (max, c) => Math.max(max, c.day_index),
          -1,
        );

        // Sequential unlock: can only claim up to highestClaimed + 1.
        if (dayIndex > highestClaimed + 1) {
          throw error(400, 'Reward not yet available — claim previous days first');
        }

        // Idempotency: unique constraint on (daily_login_id, day_index) also
        // enforces this at the DB level, but we return a friendlier error here.
        if (daily.claims.some((c) => c.day_index === dayIndex)) {
          throw error(409, 'Reward already claimed');
        }

        // Reset streak if user skipped a day (>48h since last claim).
        const skippedADay =
          daily.last_claimed_at != null &&
          now.getTime() - daily.last_claimed_at.getTime() > 2 * ONE_DAY_MS;
        const newStreak = skippedADay ? 1 : daily.streak + 1;

        // Insert claim row — DB unique constraint prevents races.
        await tx.daily_login_claim.create({
          data: { daily_login_id: daily.id, day_index: dayIndex },
        });

        daily = await tx.daily_login.update({
          where: { user_id: userId },
          data: { streak: newStreak, last_claimed_at: now },
          include: { claims: { select: { day_index: true } } },
        });
      }

      const reward = REWARD_SCHEDULE[dayIndex];
      if (!reward) throw error(500, 'Invalid reward schedule');

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: reward.coins },
          xp: { increment: reward.xp },
          ai_help_credits: { increment: reward.aiHelps },
        },
        select: { coins: true, xp: true, ai_help_credits: true },
      });

      return {
        daily,
        updatedUser,
        reward: {
          day: reward.day,
          coins: reward.coins,
          xp: reward.xp,
          aiHelps: reward.aiHelps,
        },
      };
    });

    const newlyUnlocked = await detectNewlyUnlockedAchievements(userId);

    // Derive next claimable day for the response.
    const highestClaimed = result.daily.claims.reduce(
      (max, c) => Math.max(max, c.day_index),
      -1,
    );
    const nextClaimableDay = highestClaimed + 2;

    return Response.json({
      success: true,
      day: dayNumber,
      coins: result.reward.coins,
      xp: result.reward.xp,
      aiHelps: result.reward.aiHelps,
      newCoins: result.updatedUser.coins,
      newXp: result.updatedUser.xp,
      newAiHelpCredits: result.updatedUser.ai_help_credits,
      currentDay: nextClaimableDay,
      claimedDays: result.daily.claims.map((c) => c.day_index),
      canClaimToday: false,
      nextAvailableAt: new Date(Date.now() + ONE_DAY_MS).toISOString(),
      cooldown: { remainingMs: ONE_DAY_MS, hours: 24, minutes: 0 },
      newlyUnlocked,
    });
  } catch (err) {
    console.error('Error claiming daily reward:', err);
    // Re-throw SvelteKit errors (429, 409, 400, 500) as-is.
    if (typeof err === 'object' && err !== null && 'status' in err) throw err;
    throw error(500, 'Failed to claim reward');
  }
};
