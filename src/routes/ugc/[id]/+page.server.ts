import { error, fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import prisma from "$lib/server/client";

export const load: PageServerLoad = async ({ params, locals }) => {
  const session = await locals.auth();

  if (!session?.user?.id) {
    throw redirect(302, "/login");
  }

  const id = params.id;

  if (!id) {
    throw error(400, "UGC ID is required");
  }

  // Fetch the UGC with all related data
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
    throw error(404, "UGC not found");
  }

  // Only allow owner to edit
  if (ugc.userId !== session.user.id) {
    throw error(403, "You can only edit your own submissions");
  }

  // Don't allow editing if already approved
  if (ugc.status === "approved") {
    throw error(400, "Cannot edit an approved submission");
  }

  return {
    ugc,
  };
};

export const actions = {
  default: async ({ params, request, locals }) => {
    const session = await locals.auth();

    if (!session?.user?.id) {
      return fail(401, { message: "Unauthorized" });
    }

    const id = params.id;

    if (!id) {
      return fail(400, { message: "UGC ID is required" });
    }

    // First check ownership
    const existingUgc = await prisma.userGeneratedContent.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!existingUgc) {
      return fail(404, { message: "UGC not found" });
    }

    if (existingUgc.userId !== session.user.id) {
      return fail(403, { message: "You can only edit your own submissions" });
    }

    if (existingUgc.status === "approved") {
      return fail(400, { message: "Cannot edit an approved submission" });
    }

    // Parse form data
    const formData = await request.formData();
    
    const repoLink = formData.get("repoLink") as string | null;
    const scenario = formData.get("scenario") as string | null;
    const techStacksStr = formData.get("techStacks") as string | null;
    const levelsStr = formData.get("levels") as string | null;

    // Parse tech stacks
    let techStacks: string[] = [];
    if (techStacksStr) {
      try {
        techStacks = JSON.parse(techStacksStr);
      } catch {
        return fail(400, { message: "Invalid tech stacks format" });
      }
    }

    // Parse levels
    let levels: Array<{
      title: string;
      order: number;
      description: string;
      xpReward: number;
      tasks: Array<{
        title: string;
        description: string;
        hint: string | null;
        order: number;
      }>;
    }> = [];
    
    if (levelsStr) {
      try {
        levels = JSON.parse(levelsStr);
      } catch {
        return fail(400, { message: "Invalid levels format" });
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
    if (techStacks && techStacks.length > 0) {
      updateData.techStacks = {
        deleteMany: {},
        create: techStacks.map((stack) => ({ name: stack })),
      };
    }

    // If levels is provided, replace all existing ones
    if (levels && levels.length > 0) {
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

    try {
      await prisma.userGeneratedContent.update({
        where: { id },
        data: updateData,
      });

      return { success: true, message: "UGC updated successfully" };
    } catch (err) {
      console.error("Failed to update UGC:", err);
      return fail(500, { message: "Failed to update UGC" });
    }
  },
};
