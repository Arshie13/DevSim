import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import prisma from "$lib/server/client";

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth();

  if (!session?.user?.id) {
    throw redirect(302, "/login");
  }

  // Fetch all approved user generated content (public feed)
  const ugcList = await prisma.userGeneratedContent.findMany({
    where: { status: "approved" },
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
  });

  return {
    ugcList,
  };
};
