import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import prisma from "$lib/server/client";

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth();

  if (!session?.user?.id) {
    throw redirect(302, "/login");
  }

  // Just return empty data for new form
  return {
    ugc: null,
  };
};

export const actions = {
  default: async ({ request, locals }) => {
    const session = await locals.auth();

    if (!session?.user?.id) {
      return fail(401, { message: "Unauthorized" });
    }

    // Parse form data
    const formData = await request.formData();
    
    const repoLink = formData.get("repoLink") as string | null;
    const scenario = formData.get("scenario") as string | null;
    const techStacksStr = formData.get("techStacks") as string | null;
    const levelsStr = formData.get("levels") as string | null;

    // Validate required fields
    if (!repoLink || !scenario) {
      return fail(400, { message: "Repository link and scenario are required" });
    }

    // Validate GitHub URL
    const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/;
    if (!githubUrlPattern.test(repoLink)) {
      return fail(400, { message: "Invalid GitHub repository URL format" });
    }

    // Parse tech stacks
    let techStacks: string[] = [];
    if (techStacksStr) {
      try {
        techStacks = JSON.parse(techStacksStr);
      } catch {
        return fail(400, { message: "Invalid tech stacks format" });
      }
    }

    if (techStacks.length === 0) {
      return fail(400, { message: "At least one tech stack is required" });
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

    if (levels.length === 0) {
      return fail(400, { message: "At least one level is required" });
    }

    try {
      const newUgc = await prisma.userGeneratedContent.create({
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
      });

      return { success: true, message: "Submission created successfully", ugcId: newUgc.id };
    } catch (err) {
      console.error("Failed to create UGC:", err);
      return fail(500, { message: "Failed to create submission" });
    }
  },
};
