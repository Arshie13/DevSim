import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";
import { unlockNewAchievements } from "$lib/server/achievements/unlock";

/**
 * GET /api/user/onboarding
 * Returns { completed: boolean } for the authenticated user.
 * First-time users will have completed = false.
 */
export const GET: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    throw error(401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { has_completed_tutorial: true },
  });

  if (!user) {
    throw error(404, "User not found");
  }

  return json({ completed: user.has_completed_tutorial });
};

/**
 * POST /api/user/onboarding
 * Marks the tutorial as completed for the authenticated user.
 * Idempotent — safe to call multiple times.
 */
export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    throw error(401, "Unauthorized");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { has_completed_tutorial: true },
  });

  const unlockedAchievements = await unlockNewAchievements(session.user.id);

  return json({ success: true, unlockedAchievements });
};
