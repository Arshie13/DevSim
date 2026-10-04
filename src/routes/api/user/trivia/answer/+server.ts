import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";
import { triviaQuestions } from "$lib/mocks/trivia";
import { checkRateLimit } from "$lib/server/ratelimit";
import { detectNewlyUnlockedAchievements } from "$lib/server/achievements/unlocks";

const TRIVIA_COIN_REWARD = 5;

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw error(401, "Unauthorized");
  }

  const userId = session.user.id;

  // A real user answers trivia occasionally; a burst is farming.
  if (!checkRateLimit(`trivia:${userId}`, 10, 60_000)) {
    throw error(429, "Too many trivia submissions. Please wait a moment.");
  }

  const body = await event.request.json().catch(() => null);
  const questionId = body?.questionId;
  const selectedAnswer = body?.selectedAnswer;

  if (typeof questionId !== "string" || !Number.isInteger(selectedAnswer)) {
    throw error(400, "Missing or invalid trivia answer");
  }

  // Validate against the server-side catalog — never trust a client `correct` flag.
  const question = triviaQuestions.find((q) => q.id === questionId);
  if (!question) {
    throw error(404, "Unknown trivia question");
  }

  if (selectedAnswer < 0 || selectedAnswer >= question.options.length) {
    throw error(400, "Invalid answer index");
  }

  if (selectedAnswer !== question.correctAnswer) {
    return json({ success: true, rewarded: false });
  }

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
