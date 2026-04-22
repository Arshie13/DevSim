import prisma from "$lib/server/client";
import type { UserKpis, ProfileMetricsData, WeeklyStats } from "$lib/types/dashboard";
import { formatMemberSince } from "./format";

export async function getUserKpis(userId: string): Promise<UserKpis> {
  const [stacksCompleted, achievementsUnlocked, dbUser, dailyLogin] = await Promise.all([
    prisma.container.count({ where: { userId, isArchived: true } }),
    prisma.userAchievement.count({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { xp: true } }),
    prisma.dailyLogin.findUnique({ where: { userId }, select: { streak: true } }),
  ]);

  return {
    stacksCompleted,
    totalXp: dbUser?.xp ?? 0,
    dayStreak: dailyLogin?.streak ?? 0,
    achievementsUnlocked,
  };
}

export async function getWeeklyTaskStats(userId: string): Promise<WeeklyStats> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [recentTasks, priorCount] = await Promise.all([
    prisma.completedTask.findMany({
      where: { container: { userId }, completedAt: { gte: sevenDaysAgo } },
      select: { completedAt: true },
    }),
    prisma.completedTask.count({
      where: { container: { userId }, completedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
    }),
  ]);

  // Build 7-day buckets starting from 6 days ago to today
  const days: string[] = [];
  const counts: number[] = Array(7).fill(0);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString("en-US", { weekday: "short" }));
  }

  for (const { completedAt } of recentTasks) {
    const daysAgo = Math.floor((now.getTime() - completedAt.getTime()) / (24 * 60 * 60 * 1000));
    const idx = 6 - daysAgo;
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
    achievementsCount,
    dbUser,
    dailyLogin,
    thisWeekCount,
    priorWeekCount,
  ] = await Promise.all([
    prisma.completedTask.count({ where: { container: { userId } } }),
    prisma.userFileChanges.count({ where: { container: { userId } } }),
    prisma.userAchievement.count({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { xp: true, coins: true, createdAt: true } }),
    prisma.dailyLogin.findUnique({ where: { userId }, select: { streak: true } }),
    prisma.completedTask.count({ where: { container: { userId }, completedAt: { gte: sevenDaysAgo } } }),
    prisma.completedTask.count({ where: { container: { userId }, completedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
  ]);

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
