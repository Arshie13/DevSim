import prisma from "$lib/server/client";
import type { ActivityItem } from "$lib/types/dashboard";
import { formatRelativeTime } from "./format";

function fileActionLabel(action: string): string {
  switch (action.toUpperCase()) {
    case "CREATE":
      return "File created";
    case "WRITE":
      return "File edited";
    case "DELETE":
      return "File deleted";
    case "RENAME":
      return "File renamed";
    default:
      return "File changed";
  }
}

export async function getRecentActivity(userId: string, limit = 8): Promise<ActivityItem[]> {
  const [changes, achievements] = await Promise.all([
    prisma.user_file_changes.findMany({
      where: { workspace: { user_id: userId } },
      orderBy: { timestamp: "desc" },
      take: limit,
    }),
    prisma.user_achievement.findMany({
      where: { user_id: userId },
      include: { achievement: true },
      orderBy: { created_at: "desc" },
      take: limit,
    }),
  ]);

  const fileItems: ActivityItem[] = changes.map((c) => ({
    id: c.id,
    type: "challenge" as const,
    title: c.file_path.split("/").pop() || c.file_path,
    description: fileActionLabel(c.action),
    timestamp: formatRelativeTime(c.timestamp),
    icon: "📝",
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
  const maxLen = Math.max(fileItems.length, achievementItems.length);
  for (let i = 0; i < maxLen; i++) {
    if (fileItems[i]) interleaved.push(fileItems[i]);
    if (achievementItems[i]) interleaved.push(achievementItems[i]);
  }

  return interleaved.slice(0, limit);
}
