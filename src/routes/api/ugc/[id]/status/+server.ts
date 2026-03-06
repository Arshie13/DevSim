import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";

/**
 * PATCH /api/ugc/[id]/status
 * Body: {
 *   status: "pending" | "approved" | "rejected",
 *   isFeatured?: boolean
 * }
 *
 * Updates the status of user generated content (admin only).
 */
export const PATCH: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  const userId = session?.user?.id;

  if (!userId) {
    throw error(401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role !== "admin") {
    throw error(403, "Forbidden");
  }

  const id = event.params.id;

  if (!id) {
    throw error(400, "UGC ID is required");
  }

  let body: {
    status: "pending" | "approved" | "rejected";
    isFeatured?: boolean;
  };

  try {
    body = await event.request.json();
  } catch {
    throw error(400, "Invalid JSON body");
  }

  const { status, isFeatured } = body;

  if (!["pending", "approved", "rejected"].includes(status)) {
    throw error(400, "Invalid status value");
  }

  const existingUgc = await prisma.userGeneratedContent.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingUgc) {
    throw error(404, "User generated content not found");
  }

  const updateData: {
    status: string;
    isFeatured?: boolean;
  } = {
    status,
  };

  if (isFeatured !== undefined) {
    updateData.isFeatured = isFeatured;
  }

  const updatedUgc = await prisma.userGeneratedContent.update({
    where: { id },
    data: updateData,
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
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return json({ success: true, ugc: updatedUgc });
};
