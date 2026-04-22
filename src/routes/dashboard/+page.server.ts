import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { getAllUserContainer, getArchivedContainers } from "$lib/server/docker/user/get-user-container";
import prisma from "$lib/server/client";
import { getUserKpis, getWeeklyTaskStats, getRecentActivity, getLeaderboard } from "$lib/server/stats";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  const userData = session?.user;

  if (!session?.user) {
    throw redirect(303, '/')
  }

  const [allContainers, archivedStacks, dbUser, kpis, weekly, activity, leaderboard] =
    await Promise.all([
      getAllUserContainer(userData.id),
      getArchivedContainers(userData.id),
      prisma.user.findUnique({ where: { id: userData.id }, select: { coins: true, image: true } }),
      getUserKpis(userData.id),
      getWeeklyTaskStats(userData.id),
      getRecentActivity(userData.id, 8),
      getLeaderboard(5, userData.id),
    ]);

  const userContainerList = allContainers.filter((c) => !c.isArchived);

  return {
    user: {
      ...session.user,
      image: dbUser?.image ?? session.user.image,
    },
    userContainerList,
    archivedStacks,
    userCoins: dbUser?.coins ?? 0,
    kpis,
    weekly,
    activity,
    leaderboard,
  };
}
