import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";

/**
 * GET /api/ugc/user
 * Query params:
 *   - status: "pending" | "approved" | "rejected" | "all" (optional, defaults to "all")
 *
 * Returns all user generated content submitted by the authenticated user.
 */
export const GET: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    throw error(401, "Unauthorized");
  }

  const url = new URL(event.request.url);
  const status = url.searchParams.get("status") || "all";

  if (!["pending", "approved", "rejected", "all"].includes(status)) {
    throw error(400, "Invalid status filter");
  }

  const whereClause: { userId: string; status?: string } = {
    userId: session.user.id,
  };

  if (status !== "all") {
    whereClause.status = status;
  }

  const ugcList = await prisma.userGeneratedContent.findMany({
    where: whereClause,
    include: {
      techStacks: true,
      levels: {
        include: {
          tasks: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return json({ ugc: ugcList });
};
