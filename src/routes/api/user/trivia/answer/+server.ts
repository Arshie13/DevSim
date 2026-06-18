import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";
import { detectNewlyUnlockedAchievements } from "$lib/server/achievements/unlocks";

const TRIVIA_COIN_REWARD = 5;

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw error(401, "Unauthorized");
  }

  const body = await event.request.json().catch(() => null);
  const isCorrect = body?.correct === true;

  if (!isCorrect) {
    return json({ success: true, rewarded: false });
  }

  const userId = session.user.id;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        coins: { increment: TRIVIA_COIN_REWARD },
        trivia_correct_count: { increment: 1 },
      },
      select: { coins: true, trivia_correct_count: true },
    });

    const newlyUnlocked = await detectNewlyUnlockedAchievements(userId);

    return json({
      success: true,
      rewarded: true,
      coins: TRIVIA_COIN_REWARD,
      newCoins: updatedUser.coins,
      triviaCorrectCount: updatedUser.trivia_correct_count,
      newlyUnlocked,
    });
  } catch (err) {
    console.error("Error recording trivia answer:", err);
    throw error(500, "Failed to record trivia answer");
  }
};
