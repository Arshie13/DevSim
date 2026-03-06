import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";

/**
 * GET /api/ugc/[id]
 *
 * Returns a single user generated content by ID.
 */
export const GET: RequestHandler = async (event) => {
  const id = event.params.id;

  if (!id) {
    throw error(400, "UGC ID is required");
  }

  const ugc = await prisma.userGeneratedContent.findUnique({
    where: { id },
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

  if (!ugc) {
    throw error(404, "User generated content not found");
  }

  return json({ ugc });
};

/**
 * PATCH /api/ugc/[id]
 * Body: {
 *   repoLink?: string,
 *   scenario?: string,
 *   techStacks?: string[],
 *   levels?: {
 *     id?: string, // if updating existing
 *     title: string,
 *     order: number,
 *     description: string,
 *     xpReward: number,
 *     tasks: {
 *       id?: string, // if updating existing
 *       title: string,
 *       description: string,
 *       hint?: string,
 *       order: number
 *     }[]
 *   }[]
 * }
 *
 * Updates user generated content. Only the owner can update their submission.
 * Can only update if status is "pending" or "rejected".
 */
export const PATCH: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    throw error(401, "Unauthorized");
  }

  const id = event.params.id;

  if (!id) {
    throw error(400, "UGC ID is required");
  }

  // First, check if the UGC exists and belongs to the user
  const existingUgc = await prisma.userGeneratedContent.findUnique({
    where: { id },
    select: { userId: true, status: true },
  });

  if (!existingUgc) {
    throw error(404, "User generated content not found");
  }

  if (existingUgc.userId !== session.user.id) {
    throw error(403, "You can only update your own submissions");
  }

  if (existingUgc.status === "approved") {
    throw error(400, "Cannot update an approved submission");
  }

  let body: {
    repoLink?: string;
    scenario?: string;
    techStacks?: string[];
    levels?: {
      id?: string;
      title: string;
      order: number;
      description: string;
      xpReward: number;
      tasks: {
        id?: string;
        title: string;
        description: string;
        hint?: string;
        order: number;
      }[];
    }[];
  };

  try {
    body = await event.request.json();
  } catch {
    throw error(400, "Invalid JSON body");
  }

  const { repoLink, scenario, techStacks, levels } = body;

  // Validate GitHub URL if provided
  if (repoLink) {
    const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/;
    if (!githubUrlPattern.test(repoLink)) {
      throw error(400, "Invalid GitHub repository URL format");
    }
  }

  // Build update data
  const updateData: {
    repoLink?: string;
    scenario?: string;
    techStacks?: {
      deleteMany: {};
      create: { name: string }[];
    };
    levels?: {
      create: {
        title: string;
        order: number;
        description: string;
        xpReward: number;
        tasks: {
          create: {
            title: string;
            description: string;
            hint: string | null;
            order: number;
          }[];
        };
      }[];
    };
  } = {};

  if (repoLink) {
    updateData.repoLink = repoLink;
  }

  if (scenario) {
    updateData.scenario = scenario;
  }

  // If techStacks is provided, replace all existing ones
  if (techStacks && Array.isArray(techStacks)) {
    updateData.techStacks = {
      deleteMany: {},
      create: techStacks.map((stack) => ({ name: stack })),
    };
  }

  // If levels is provided, replace all existing ones
  if (levels && Array.isArray(levels)) {
    // First delete all existing levels (cascades to tasks)
    await prisma.uGCLevel.deleteMany({
      where: { ugcId: id },
    });

    updateData.levels = {
      create: levels.map((level) => ({
        title: level.title,
        order: level.order,
        description: level.description,
        xpReward: level.xpReward,
        tasks: {
          create: level.tasks.map((task) => ({
            title: task.title,
            description: task.description,
            hint: task.hint || null,
            order: task.order,
          })),
        },
      })),
    };
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

/**
 * DELETE /api/ugc/[id]
 *
 * Deletes user generated content. Only the owner can delete their submission.
 */
export const DELETE: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    throw error(401, "Unauthorized");
  }

  const id = event.params.id;

  if (!id) {
    throw error(400, "UGC ID is required");
  }

  // First, check if the UGC exists and belongs to the user
  const existingUgc = await prisma.userGeneratedContent.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existingUgc) {
    throw error(404, "User generated content not found");
  }

  if (existingUgc.userId !== session.user.id) {
    throw error(403, "You can only delete your own submissions");
  }

  await prisma.userGeneratedContent.delete({
    where: { id },
  });

  return json({ success: true });
};
