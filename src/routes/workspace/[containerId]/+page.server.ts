import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/client";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, '/')
  }

  // Get user data including coins
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, coins: true, name: true }
  });

  return {
    user: session.user,
    userId: user?.id || "",
    userCoins: user?.coins || 0
  };
}
