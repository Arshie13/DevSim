import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/client";
import { getAchievementsForUser } from "$lib/server/achievements/catalog";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user || !session.user.id) {
    throw redirect(303, "/");
  }

  const achievements = await getAchievementsForUser(session.user.id);

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { coins: true, image: true, owned_avatars: true },
  });

  return {
    achievements,
    user: {
      ...session.user,
      avatar:
        dbUser?.image ||
        dbUser?.owned_avatars[0] ||
        session.user.image ||
        session.user.avatar,
    },
    userCoins: dbUser?.coins ?? 0,
  };
};
