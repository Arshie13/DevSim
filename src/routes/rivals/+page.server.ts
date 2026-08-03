import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import prisma from "$lib/server/client";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw redirect(303, "/login");
  }

  try {
    // Get the current user's XP to calculate closest rivals
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coins: true, image: true, owned_avatars: true, xp: true },
    });

    const currentUserXp = dbUser?.xp ?? 0;

    // Fetch users above and below the current user's XP so we get a balanced
    // pool of nearby rivals (not just the global top).
    const [above, below] = await Promise.all([
      prisma.user.findMany({
        where: { id: { not: session.user.id }, xp: { gte: currentUserXp } },
        orderBy: { xp: "asc" },
        take: 50,
        select: {
          id: true, username: true, name: true, image: true,
          owned_avatars: true, xp: true,
          workspaces: { where: { status: "completed" }, select: { id: true } },
          achievements: { select: { id: true } },
        },
      }),
      prisma.user.findMany({
        where: { id: { not: session.user.id }, xp: { lt: currentUserXp } },
        orderBy: { xp: "desc" },
        take: 50,
        select: {
          id: true, username: true, name: true, image: true,
          owned_avatars: true, xp: true,
          workspaces: { where: { status: "completed" }, select: { id: true } },
          achievements: { select: { id: true } },
        },
      }),
    ]);

    // Interleave by proximity — closest above first, then closest below
    const sorted: (typeof above[0] & { diff: number })[] = [];
    let ai = 0, bi = 0;
    while (ai < above.length || bi < below.length) {
      const aDiff = ai < above.length ? Math.abs(above[ai].xp - currentUserXp) : Infinity;
      const bDiff = bi < below.length ? Math.abs(below[bi].xp - currentUserXp) : Infinity;
      if (aDiff <= bDiff) {
        sorted.push({ ...above[ai++], diff: aDiff });
      } else {
        sorted.push({ ...below[bi++], diff: bDiff });
      }
    }

    const rivals = sorted.map((u) => {
      return {
        id: u.id,
        username: u.username,
        name: u.name,
        image: u.owned_avatars[0] || u.image || "",
        xp: u.xp,
        completedProjects: u.workspaces.length,
        achievementsCount: u.achievements.length,
        isCurrentUser: u.id === session.user?.id,
      };
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
