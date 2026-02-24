import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { getAllUserContainer, getArchivedContainers } from "$lib/server/docker/user/get-user-container";
import prisma from "$lib/server/client";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, '/')
  }

  const [allContainers, archivedStacks, dbUser] = await Promise.all([
    getAllUserContainer(session.user.id),
    getArchivedContainers(session.user.id),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { coins: true } }),
  ]);

  const userContainerList = allContainers.filter((c) => !c.isArchived);

  return {
    user: session.user,
    userContainerList,
    archivedStacks,
    userCoins: dbUser?.coins ?? 0,
  };
}
