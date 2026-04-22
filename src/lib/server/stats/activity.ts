import prisma from "$lib/server/client";
import type { ActivityItem } from "$lib/types/dashboard";
import { formatRelativeTime } from "./format";

export async function getRecentActivity(userId: string, limit = 8): Promise<ActivityItem[]> {
  const [tasks, achievements] = await Promise.all([
    prisma.completedTask.findMany({
      where: { container: { userId } },
      include: { container: { select: { level: true } } },
      orderBy: { completedAt: "desc" },
      take: limit,
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
      take: limit,
    }),
  ]);

  const taskItems: ActivityItem[] = tasks.map((t) => ({
    id: t.id,
    type: "challenge" as const,
    title: t.taskName,
    description: `Task completed in Level ${t.container.level}`,
    timestamp: formatRelativeTime(t.completedAt),
    icon: "🐛",
  }));

  const achievementItems: ActivityItem[] = achievements.map((a) => ({
    id: a.id,
    type: "achievement" as const,
    title: a.achievement.name,
    description: a.achievement.description,
    timestamp: formatRelativeTime(a.earnedAt),
    icon: a.achievement.icon ?? "🏅",
    xp: a.achievement.xpReward,
  }));

  // Interleave both lists (each already ordered desc by date) then slice to limit
  const interleaved: ActivityItem[] = [];
  const maxLen = Math.max(taskItems.length, achievementItems.length);
  for (let i = 0; i < maxLen; i++) {
    if (taskItems[i]) interleaved.push(taskItems[i]);
    if (achievementItems[i]) interleaved.push(achievementItems[i]);
  }

  return interleaved.slice(0, limit);
}
