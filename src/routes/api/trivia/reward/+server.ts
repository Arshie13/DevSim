import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import { unlockNewAchievements } from '$lib/server/achievements/unlock';

const XP_REWARD = 25;
const COIN_REWARD = 15;

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) throw error(401, 'Unauthorized');

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      xp: { increment: XP_REWARD },
      coins: { increment: COIN_REWARD },
      trivia_correct_count: { increment: 1 },
    },
    select: { xp: true, coins: true, trivia_correct_count: true },
  });

  const unlockedAchievements = await unlockNewAchievements(session.user.id);

  return json({
    success: true,
    xp: XP_REWARD,
    coins: COIN_REWARD,
    triviaCorrect: updatedUser.trivia_correct_count,
    unlockedAchievements,
  });
};
