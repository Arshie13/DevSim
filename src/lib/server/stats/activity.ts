import prisma from "$lib/server/client";
import type { ActivityItem, TaskActivityEntry } from "$lib/types/dashboard";
import { formatRelativeTime } from "./format";

export async function getRecentActivity(userId: string, limit = 8): Promise<ActivityItem[]> {
  const [user, achievements] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { task_activity: true },
    }),
    prisma.user_achievement.findMany({
      where: { user_id: userId },
      include: { achievement: true },
      orderBy: { created_at: "desc" },
      take: limit,
    }),
  ]);

  // Activity log lives on the user as a JSON array; sort newest-first in app code.
  const log: TaskActivityEntry[] = Array.isArray(user?.task_activity)
    ? (user!.task_activity as unknown as TaskActivityEntry[])
    : [];
  const tasks = [...log]
    .sort((a, b) => b.completed_at.localeCompare(a.completed_at))
    .slice(0, limit);

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
