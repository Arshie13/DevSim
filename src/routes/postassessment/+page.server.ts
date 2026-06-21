import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/client";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, "/");
  }

  // Gate: the post-assessment no longer requires finishing the final level
  // (level 5). Any user with a workspace can reach it. We still redirect when
  // there's no container at all.
  const latestContainer = await prisma.workspace.findFirst({
    where: { user_id: session.user.id },
    orderBy: { created_at: "desc" },
    select: { id: true },
  });

  if (!latestContainer) {
    throw redirect(303, "/dashboard");
  }

  return {};
};
