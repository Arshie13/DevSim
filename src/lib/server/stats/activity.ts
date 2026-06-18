import prisma from "$lib/server/client";
import type { ActivityItem } from "$lib/types/dashboard";
import { formatRelativeTime } from "./format";

export async function getRecentActivity(userId: string, limit = 8): Promise<ActivityItem[]> {
  const [tasks, achievements] = await Promise.all([
    // Recent task completions, newest-first, from the durable task_activity
    // table (not wiped on level advance, so the feed keeps full history).
    prisma.task_activity.findMany({
      where: { user_id: userId },
      select: { id: true, task_name: true, level: true, completed_at: true },
      orderBy: { completed_at: "desc" },
      take: limit,
    }),
    prisma.user_achievement.findMany({
      where: { user_id: userId },
      include: { achievement: true },
      orderBy: { created_at: "desc" },
      take: limit,
    }),
  ]);

  const taskItems: ActivityItem[] = tasks.map((t) => ({
    id: t.id,
    type: "challenge" as const,
    title: t.task_name,
    description: `Task completed in Level ${t.level}`,
    timestamp: formatRelativeTime(new Date(t.completed_at)),
    icon: "🐛",
  }));

  const achievementItems: ActivityItem[] = achievements.map((a) => ({
    id: a.id,
    type: "achievement" as const,
    title: a.achievement.name,
    description: a.achievement.description,
    timestamp: formatRelativeTime(a.created_at),
    icon: a.achievement.icon ?? "🏅",
    xp: a.achievement.xp_reward,
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
