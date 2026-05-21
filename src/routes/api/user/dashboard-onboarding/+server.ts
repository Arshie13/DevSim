import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";

/**
 * POST /api/user/dashboard-onboarding
 * Marks the dashboard onboarding as seen for the authenticated user.
 * Idempotent — safe to call multiple times.
 */
export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    throw error(401, "Unauthorized");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { has_seen_dashboard_onboarding: true },
  });

  return json({ success: true });
};
