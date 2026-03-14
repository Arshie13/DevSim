import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";
import { PREMIUM_AVATARS } from "$lib/utils/avatar";

/**
 * POST /api/user/avatar/purchase
 * Body: { avatarPath: string }
 *
 * Purchases a premium avatar for the authenticated user using their coins.
 * Validates ownership, affordability, and deducts coins atomically.
 */
export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    throw error(401, "Unauthorized");
  }

  let body: { avatarPath?: string };
  try {
    body = await event.request.json();
  } catch {
    throw error(400, "Invalid JSON body");
  }

  const { avatarPath } = body;

  if (!avatarPath || typeof avatarPath !== "string") {
    throw error(400, "avatarPath is required and must be a string");
  }

  // Validate it is a known premium avatar
  const premiumAvatar = PREMIUM_AVATARS.find((a) => a.path === avatarPath);
  if (!premiumAvatar) {
    throw error(400, "Unknown or non-premium avatar path");
  }

  // Fetch current user state
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { coins: true, ownedAvatars: true },
  });

  if (!dbUser) {
    throw error(404, "User not found");
  }

  // Check not already owned
  if (dbUser.ownedAvatars.includes(avatarPath)) {
    throw error(409, "Avatar already owned");
  }

  // Check affordability
  if (dbUser.coins < premiumAvatar.price) {
    throw error(402, "Insufficient coins");
  }

  // Deduct coins and add avatar atomically
  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      coins: { decrement: premiumAvatar.price },
      ownedAvatars: { push: avatarPath },
    },
    select: { coins: true, ownedAvatars: true },
  });

  return json({
    success: true,
    newCoins: updated.coins,
    ownedAvatars: updated.ownedAvatars,
  });
};
