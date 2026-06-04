import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    throw error(401, "Unauthorized");
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: {
        xp: "desc",
      },
      where: {
        NOT: {
          id: session.user.id,
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        owned_avatars: true, // This field is used in ProfileDropDown, but let's check schema again
        image: true,
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
      take: 100, // Limit to top 100
    });

    const rivals = users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      avatar: u.owned_avatars[0] || u.image || "",
      xp: u.xp,
      level: u.level,
      completedProjects: u.workspaces.length,
      achievementsCount: u.achievements.length,
      isCurrentUser: u.id === session.user?.id,
    }));

    return json({ rivals });
  } catch (err) {
    console.error("[Rivals API] Error fetching:", err);
    throw error(500, "Failed to fetch rivals");
  }
};
