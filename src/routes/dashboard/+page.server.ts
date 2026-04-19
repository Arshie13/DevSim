import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { getAllUserContainer, getArchivedContainers } from "$lib/server/docker/user/get-user-container";
import prisma from "$lib/server/client";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  const userData = session?.user;

  if (!userData || !userData.id) {
    throw redirect(303, '/')
  }

  const [allContainers, archivedStacks, dbUser] = await Promise.all([
    getAllUserContainer(userData.id),
    getArchivedContainers(userData.id),
    prisma.user.findUnique({ where: { id: userData.id }, select: { coins: true, image: true } }),
  ]);

  const userContainerList = allContainers.filter((c) => !c.is_archived);

  return {
    user: {
      ...session.user,
      // Override session image with live DB value so avatar changes are
      // reflected immediately without requiring a re-login.
      image: dbUser?.image ?? userData.image,
    },
    userContainerList,
    archivedStacks,
    userCoins: dbUser?.coins ?? 0,
  };
  
}
