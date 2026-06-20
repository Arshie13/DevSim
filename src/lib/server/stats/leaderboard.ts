import prisma from "$lib/server/client";
import type { LeaderboardEntry, RivalEntry } from "$lib/types/dashboard";
import { computeLevel } from "$lib/utils/level";

export async function getLeaderboard(limit = 5, currentUserId?: string): Promise<LeaderboardEntry[]> {
  const users = await prisma.user.findMany({
    orderBy: { xp: "desc" },
    take: limit,
    select: { id: true, username: true, name: true, image: true, owned_avatars: true, xp: true, level: true },
  });

  return users.map((u, idx) => {
    const levelData = computeLevel(u.xp);
    return {
      rank: idx + 1,
      username: u.username ?? u.name,
      name: u.name,
      avatar: u.image || u.owned_avatars[0] || "🧑‍💻",
      xp: u.xp,
      level: levelData.level,
      isCurrentUser: u.id === currentUserId,
    };
  });
}

export async function getRivals(userId: string, limit = 6): Promise<RivalEntry[]> {
  const users = await prisma.user.findMany({
    where: { id: { not: userId } },
    orderBy: { xp: "desc" },
    take: limit,
    select: { id: true, username: true, name: true, image: true, xp: true, level: true },
  });

  return users.map((u) => {
    const levelData = computeLevel(u.xp);
    return {
      id: u.id,
      username: u.username ?? u.name,
      name: u.name,
      image: u.image,
      xp: u.xp,
      level: levelData.level,
    };
  });
}
