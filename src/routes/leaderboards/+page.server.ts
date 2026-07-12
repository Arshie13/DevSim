import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import prisma from "$lib/server/client";
import type { LeaderboardEntry } from "$types";

const TOP_N = 10;

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw redirect(303, "/login");
  }

  try {
    const topUsers = await prisma.user.findMany({
      orderBy: { xp: "desc" },
      take: TOP_N,
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        owned_avatars: true,
        xp: true,
      },
    });

    const entries: LeaderboardEntry[] = topUsers.map((u, idx) => ({
      rank: idx + 1,
      username: u.username ?? u.name ?? "",
      name: u.name ?? undefined,
      avatar: u.image || u.owned_avatars[0] || "",
      xp: u.xp,
      level: 1,
      isCurrentUser: u.id === session.user!.id,
    }));

    let currentUserEntry: LeaderboardEntry | null = null;
    const inTopN = entries.some((e) => e.isCurrentUser);

    if (!inTopN) {
      const me = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          username: true,
          name: true,
          image: true,
          owned_avatars: true,
          xp: true,
        },
      });

      if (me) {
        const higherCount = await prisma.user.count({
          where: { xp: { gt: me.xp } },
        });
        currentUserEntry = {
          rank: higherCount + 1,
          username: me.username ?? me.name ?? "",
          name: me.name ?? undefined,
          avatar: me.image || me.owned_avatars[0] || "",
          xp: me.xp,
          level: 1,
          isCurrentUser: true,
        };
      }
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coins: true, image: true, owned_avatars: true },
    });

    return {
      entries,
      currentUserEntry,
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
  } catch (err) {
    console.error("[Leaderboards Page] Load error:", err);
    throw error(500, "Failed to load leaderboards data");
  }
};
