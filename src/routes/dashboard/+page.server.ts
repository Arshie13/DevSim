import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { getAllUserContainer, getArchivedContainers } from "$lib/server/docker/user/get-user-container";
import prisma from "$lib/server/client";
import { getUserKpis, getWeeklyTaskStats, getRecentActivity, getLeaderboard } from "$lib/server/stats";
import { getAchievementFeedItems } from "$lib/server/achievements/catalog";
import { scanStacks } from "$lib/server/stacks/stack-scanner";
import { getStackRecommendation } from "$lib/server/recommend";
import type { StackRecommendation } from "$lib/server/recommend";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  const userData = session?.user;

  if (!userData || !userData.id) {
    throw redirect(303, '/')
  }

  const [allContainers, archivedStacks, dbUser, kpis, weekly, activity, leaderboard, achievementItems, catalog] =
    await Promise.all([
      getAllUserContainer(userData.id),
      getArchivedContainers(userData.id),
      prisma.user.findUnique({ where: { id: userData.id }, select: { coins: true, image: true, has_seen_dashboard_onboarding: true, username: true } }),
      getUserKpis(userData.id),
      getWeeklyTaskStats(userData.id),
      getRecentActivity(userData.id, 8),
      getLeaderboard(5, userData.id),
      getAchievementFeedItems(userData.id, 5),
      scanStacks(),
    ]);

  const userContainerList = allContainers.filter((c) => !c.isArchived);
  const recommendation: StackRecommendation | null = getStackRecommendation({
    activeContainers: userContainerList,
    archivedContainers: archivedStacks,
    catalog,
  });

  return {
    user: {
      ...session.user,
      // Override session image with live DB value so avatar changes are
      // reflected immediately without requiring a re-login.
      image: dbUser?.image ?? userData.image,
      username: dbUser?.username,
      hasSeenDashboardOnboarding: dbUser?.has_seen_dashboard_onboarding ?? false,
    },
    userContainerList,
    archivedStacks,
    userCoins: dbUser?.coins ?? 0,
    kpis,
    weekly,
    activity,
    leaderboard,
    achievementItems,
    recommendation,
  };
}
