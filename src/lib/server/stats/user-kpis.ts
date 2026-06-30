import prisma from "$lib/server/client";
import type { UserKpis, ProfileMetricsData, WeeklyStats } from "$lib/types/dashboard";
import { formatMemberSince } from "./format";
import { getAchievementsForUser } from "$lib/server/achievements/catalog";

export async function getUserKpis(userId: string): Promise<UserKpis> {
  const [stacksCompleted, allAchievements, dbUser, dailyLogin] = await Promise.all([
    prisma.workspace.count({ where: { user_id: userId, is_archived: true } }),
    getAchievementsForUser(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { xp: true } }),
    prisma.daily_login.findUnique({ where: { user_id: userId }, select: { streak: true } }),
  ]);

  const achievementsUnlocked = allAchievements.filter((a) =>
    a.tiers.some((t) => t.unlocked),
  ).length;

  return {
    stacksCompleted,
    totalXp: dbUser?.xp ?? 0,
    dayStreak: dailyLogin?.streak ?? 0,
    achievementsUnlocked,
  };
}

export async function getWeeklyTaskStats(userId: string): Promise<WeeklyStats> {
  // Calendar-day window: today plus the 6 previous days, bucketed by local
  // date so bars line up with their weekday labels.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const windowStart = new Date(startOfToday);
  windowStart.setDate(windowStart.getDate() - 6);
  const priorStart = new Date(windowStart);
  priorStart.setDate(priorStart.getDate() - 7);

  // Activity is measured by task completions, sourced from the durable
  // task_activity table by completed_at. Survives level advances, so the
  // chart reflects the user's full history.
  const rows = await prisma.task_activity.findMany({
    where: { user_id: userId, completed_at: { gte: priorStart } },
    select: { completed_at: true },
  });

  // Build 7-day buckets starting from 6 days ago to today
  const days: string[] = [];
  const counts: number[] = Array(7).fill(0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(windowStart);
    d.setDate(d.getDate() + i);
    days.push(d.toLocaleDateString("en-US", { weekday: "short" }));
  }

  let priorCount = 0;
  for (const row of rows) {
    const ts = new Date(row.completed_at);
    if (ts >= priorStart && ts < windowStart) {
      priorCount++; // previous 7-day window, for growth comparison
      continue;
    }
    if (ts < windowStart) continue; // older than both windows
    const day = new Date(ts);
    day.setHours(0, 0, 0, 0);
    // Math.round absorbs DST offset drift between bucket boundaries.
    const idx = Math.round((day.getTime() - windowStart.getTime()) / (24 * 60 * 60 * 1000));
    if (idx >= 0 && idx < 7) counts[idx]++;
  }

  const total = counts.reduce((s, c) => s + c, 0);
  const avgPerDay = Math.round((total / 7) * 10) / 10;

  let growthLabel = "+0%";
  if (priorCount > 0) {
    const pct = Math.round(((total - priorCount) / priorCount) * 100);
    growthLabel = pct >= 0 ? `+${pct}%` : `${pct}%`;
  } else if (total > 0) {
    growthLabel = "+100%";
  }

  return { counts, days, total, avgPerDay, growthLabel };
}

export async function getProfileMetrics(userId: string): Promise<ProfileMetricsData> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [
    tasksCompleted,
    fileEdits,
    allAchievements,
    dbUser,
    dailyLogin,
    thisWeekCount,
    priorWeekCount,
  ] = await Promise.all([
    // Durable counts from task_activity (survive level advances).
    prisma.task_activity.count({ where: { user_id: userId } }),
    prisma.file_changes.count({ where: { workspace: { user_id: userId } } }),
    getAchievementsForUser(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { xp: true, coins: true, createdAt: true } }),
    prisma.daily_login.findUnique({ where: { user_id: userId }, select: { streak: true } }),
    prisma.task_activity.count({ where: { user_id: userId, completed_at: { gte: sevenDaysAgo } } }),
    prisma.task_activity.count({ where: { user_id: userId, completed_at: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
  ]);

  const achievementsCount = allAchievements.filter((a) =>
    a.tiers.some((t) => t.unlocked),
  ).length;

  const currentXp = dbUser?.xp ?? 0;
  const leaderboardRank = (await prisma.user.count({ where: { xp: { gt: currentXp } } })) + 1;

  let weeklyGrowth = "+0%";
  if (priorWeekCount > 0) {
    const pct = Math.round(((thisWeekCount - priorWeekCount) / priorWeekCount) * 100);
    weeklyGrowth = pct >= 0 ? `+${pct}%` : `${pct}%`;
  } else if (thisWeekCount > 0) {
    weeklyGrowth = "+100%";
  }

  return {
    tasksCompleted,
    fileEdits,
    coinsEarned: dbUser?.coins ?? 0,
    achievementsCount,
    memberSince: dbUser?.createdAt ?? new Date(),
    dayStreak: dailyLogin?.streak ?? 0,
    leaderboardRank,
    weeklyGrowth,
  };
}
