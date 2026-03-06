import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";

/**
 * POST /api/ugc
 * Body: {
 *   repoLink: string,
 *   scenario: string,
 *   techStacks: string[], // array of tech stack names
 *   levels: {
 *     title: string,
 *     order: number,
 *     description: string,
 *     xpReward: number,
 *     tasks: {
 *       title: string,
 *       description: string,
 *       hint?: string,
 *       order: number
 *     }[]
 *   }[]
 * }
 *
 * Creates a new user generated content submission.
 */
export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    throw error(401, "Unauthorized");
  }

  let body: {
    repoLink: string;
    scenario: string;
    techStacks: string[];
    levels: {
      title: string;
      order: number;
      description: string;
      xpReward: number;
      tasks: {
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

  if (!repoLink || typeof repoLink !== "string") {
    throw error(400, "repoLink is required and must be a string");
  }

  if (!scenario || typeof scenario !== "string") {
    throw error(400, "scenario is required and must be a string");
  }

  // Validate GitHub URL format
  const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/;
  if (!githubUrlPattern.test(repoLink)) {
    throw error(400, "Invalid GitHub repository URL format");
  }

  if (!Array.isArray(techStacks) || techStacks.length === 0) {
    throw error(400, "techStacks must be a non-empty array");
  }

  if (!Array.isArray(levels) || levels.length === 0) {
    throw error(400, "levels must be a non-empty array");
  }

  // Create the user generated content with nested relations
  const ugc = await prisma.userGeneratedContent.create({
    data: {
      userId: session.user.id,
      repoLink,
      scenario,
      techStacks: {
        create: techStacks.map((stack) => ({ name: stack })),
      },
      levels: {
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
      },
    },
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

  return json({ success: true, ugc });
};

/**
 * GET /api/ugc
 * Query params:
 *   - status: "pending" | "approved" | "rejected" (optional, defaults to "approved")
 *   - limit: number (optional, defaults to 20)
 *   - offset: number (optional, defaults to 0)
 *
 * Returns all approved user generated content (public feed).
 */
export const GET: RequestHandler = async (event) => {
  const url = new URL(event.request.url);
  const status = url.searchParams.get("status") || "approved";
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  if (!["pending", "approved", "rejected"].includes(status)) {
    throw error(400, "Invalid status filter");
  }

  const ugcList = await prisma.userGeneratedContent.findMany({
    where: {
      status,
    },
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
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: offset,
  });

  const total = await prisma.userGeneratedContent.count({
    where: { status },
  });

  return json({ ugc: ugcList, total, limit, offset });
};
