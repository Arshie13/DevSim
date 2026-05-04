import prisma from "$lib/server/client";
import type { LeaderboardEntry, RivalEntry } from "$lib/types/dashboard";

export async function getLeaderboard(limit = 5, currentUserId?: string): Promise<LeaderboardEntry[]> {
  const users = await prisma.user.findMany({
    orderBy: { xp: "desc" },
    take: limit,
    select: { id: true, username: true, name: true, image: true, xp: true, level: true },
  });

  return users.map((u, idx) => ({
    rank: idx + 1,
    username: u.username ?? u.name,
    name: u.name,
    avatar: u.image ?? "🧑‍💻",
    xp: u.xp,
    level: u.level,
    isCurrentUser: u.id === currentUserId,
  }));
}

export async function getRivals(userId: string, limit = 6): Promise<RivalEntry[]> {
  const users = await prisma.user.findMany({
    where: { id: { not: userId } },
    orderBy: { xp: "desc" },
    take: limit,
    select: { id: true, username: true, name: true, image: true, xp: true, level: true },
  });

  return users.map((u) => ({
    id: u.id,
    username: u.username ?? u.name,
    name: u.name,
    image: u.image,
    xp: u.xp,
    level: u.level,
  }));
}
