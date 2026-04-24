import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { getAchievementsForUser } from "$lib/server/achievements/catalog";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, "/");
  }

  const achievements = await getAchievementsForUser(session.user.id);

  return { achievements };
};
