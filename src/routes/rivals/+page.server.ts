import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import prisma from "$lib/server/client";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw redirect(303, "/login");
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: session.user.id,
        },
      },
      orderBy: {
        xp: "desc",
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        owned_avatars: true,
        xp: true,
        level: true,
        workspaces: {
          where: {
            status: "completed",
          },
          select: {
            id: true,
          },
        },
        achievements: {
          select: {
            id: true,
          },
        },
      },
      take: 100,
    });

    const rivals = users.map((u, index) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      image: u.owned_avatars[0] || u.image || "",
      xp: u.xp,
      level: u.level,
      completedProjects: u.workspaces.length,
      achievementsCount: u.achievements.length,
      isCurrentUser: u.id === session.user?.id,
      rank: index + 1,
    }));

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coins: true, image: true, owned_avatars: true },
    });

    return {
      rivals,
      user: {
        ...session.user,
        avatar:
          dbUser?.owned_avatars[0] ||
          dbUser?.image ||
          session.user.image,
      },
      userCoins: dbUser?.coins ?? 0,
    };
  } catch (err) {
    console.error("[Rivals Page] Load error:", err);
    throw error(500, "Failed to load rivals data");
  }
};
