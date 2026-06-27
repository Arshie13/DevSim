import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { getAllUserContainer, getArchivedContainers } from "$lib/server/docker/user/get-user-container";
import prisma from "$lib/server/client";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  
  if (!session?.user || !session.user.id) {
    throw redirect(303, "/");
  }
  
  const userId = session.user.id;

  const [allContainers, archivedStacks, dbUser] = await Promise.all([
    getAllUserContainer(userId),
    getArchivedContainers(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true, image: true },
    }),
  ]);

  const currentContainers = allContainers.filter((c) => !c.isArchived);

  return {
    user: {
      ...session.user,
      image: dbUser?.image ?? session.user.image,
    },
    currentContainers,
    finishedContainers: archivedStacks,
    userCoins: dbUser?.coins ?? 0,
  };
};
