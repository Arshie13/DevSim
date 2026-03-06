import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import prisma from "$lib/server/client";

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth();

  if (!session?.user?.id) {
    throw redirect(302, "/login");
  }

  // Fetch all user's UGC
  const ugcList = await prisma.userGeneratedContent.findMany({
    where: { userId: session.user.id },
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

  return {
    ugcList,
  };
};
