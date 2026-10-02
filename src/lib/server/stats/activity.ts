import prisma from "$lib/server/client";
import type { ActivityItem } from "$lib/types/dashboard";
import { formatRelativeTime } from "./format";
import { findTierDef, tierKey } from "$lib/server/achievements/definitions";

export async function getRecentActivity(userId: string, limit = 8): Promise<ActivityItem[]> {
  const [tasks, unlocks] = await Promise.all([
    prisma.task_activity.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        completed_at: true,
        level_task: {
          select: {
            task_name: true,
            level: { select: { order: true, scenario: { select: { name: true } } } },
          },
        },
      },
      orderBy: { completed_at: "desc" },
      take: limit,
    }),
    prisma.user_achievement.findMany({
      where: { user_id: userId },
      orderBy: { earned_at: "desc" },
      take: limit,
    }),
  ]);

  const taskItems: ActivityItem[] = tasks.map((t) => ({
    id: t.id,
    type: "challenge" as const,
    title: t.level_task.task_name,
    description: `Level ${t.level_task.level.order} · ${t.level_task.level.scenario.name}`,
    timestamp: formatRelativeTime(new Date(t.completed_at)),
    icon: "🐛",
  }));

  // Display metadata comes from the code catalog. `findTierDef` resolves retired
  // families too, so historical unlocks keep rendering after a tier is retired.
  const achievementItems: ActivityItem[] = unlocks.flatMap((u) => {
    const def = findTierDef(u.family, u.tier);
    if (!def) {
      console.warn(`[activity] unknown achievement: ${u.family}:${u.tier}`);
      return [];
    }
    return [{
      id: tierKey(u.family, u.tier),
      type: "achievement" as const,
      title: def.name,
      description: def.tierDescription,
      timestamp: formatRelativeTime(u.earned_at),
      icon: def.icon ?? "🏅",
      // The amount actually granted, not the current code constant.
      xp: u.xp_awarded,
    }];
  });

  const interleaved: ActivityItem[] = [];
  const maxLen = Math.max(taskItems.length, achievementItems.length);
  for (let i = 0; i < maxLen; i++) {
    if (taskItems[i]) interleaved.push(taskItems[i]);
    if (achievementItems[i]) interleaved.push(achievementItems[i]);
  }

  return interleaved.slice(0, limit);
}
