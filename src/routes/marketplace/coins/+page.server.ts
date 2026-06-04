import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/client";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  const userData = session?.user;

  if (!userData || !userData.id) {
    throw redirect(303, '/');
  }

  const user = await prisma.user.findUnique({
    where: { id: userData.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      coins: true,
      xp: true,
      level: true,
      owned_avatars: true,
      has_completed_tutorial: true,
    }
  });

  if (!user) {
    throw redirect(303, '/');
  }

  return {
    user: {
      ...user,
      ownedAvatars: user.owned_avatars,
      hasCompletedTutorial: user.has_completed_tutorial,
    }
  };
};
