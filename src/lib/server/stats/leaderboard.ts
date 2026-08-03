import prisma from "$lib/server/client";
import type { LeaderboardEntry, RivalEntry } from "$lib/types/dashboard";
import { computeLevel } from "$lib/utils/level";

export async function getLeaderboard(limit = 5, currentUserId?: string): Promise<LeaderboardEntry[]> {
  const users = await prisma.user.findMany({
    orderBy: { xp: "desc" },
    take: limit,
    select: { id: true, username: true, name: true, image: true, owned_avatars: true, xp: true },
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

export async function getRivals(
  userId: string,
  referenceXp: number,
  limit = 4,
): Promise<RivalEntry[]> {
  // Fetch users just above and just below the reference XP so we always get
  // the closest rivals regardless of where the user sits on the leaderboard.
  const [above, below] = await Promise.all([
    prisma.user.findMany({
      where: { id: { not: userId }, xp: { gte: referenceXp } },
      orderBy: { xp: "asc" },
      take: limit,
      select: { id: true, username: true, name: true, image: true, xp: true },
    }),
    prisma.user.findMany({
      where: { id: { not: userId }, xp: { lt: referenceXp } },
      orderBy: { xp: "desc" },
      take: limit,
      select: { id: true, username: true, name: true, image: true, xp: true },
    }),
  ]);

  // Interleave by proximity — closest above first, then closest below, etc.
  const closest: typeof above = [];
  let ai = 0, bi = 0;
  while (closest.length < limit && (ai < above.length || bi < below.length)) {
    const aDiff = ai < above.length ? Math.abs(above[ai].xp - referenceXp) : Infinity;
    const bDiff = bi < below.length ? Math.abs(below[bi].xp - referenceXp) : Infinity;
    if (aDiff <= bDiff) closest.push(above[ai++]);
    else closest.push(below[bi++]);
  }

  return closest.map((u) => {
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
