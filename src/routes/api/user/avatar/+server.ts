import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";
import { ALL_AVATARS } from "$lib/utils/avatar";

/**
 * PATCH /api/user/avatar
 * Body: { avatarPath: string }
 *
 * Updates the authenticated user's avatar in the database.
 * Only accepts paths that correspond to known DevSim avatars.
 */
export const PATCH: RequestHandler = async (event) => {
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

  // Validate that the path belongs to a known avatar to prevent arbitrary URL injection
  const isKnownAvatar = ALL_AVATARS.some((a) => a.path === avatarPath);
  if (!isKnownAvatar) {
    throw error(400, "Unknown avatar path");
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: { image: avatarPath },
    select: { id: true, image: true },
  });

  return json({ success: true, image: updatedUser.image });
};
