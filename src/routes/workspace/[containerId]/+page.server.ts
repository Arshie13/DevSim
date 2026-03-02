import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
<<<<<<< feat/ai-helper
import prisma from "$lib/server/client";
=======
import prisma from '$lib/server/client';
>>>>>>> main

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, '/');
  }

<<<<<<< feat/ai-helper
  // Get user data including coins
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, coins: true, name: true }
  });

  return {
    user: session.user,
    userId: user?.id || "",
    userCoins: user?.coins || 0
=======
  // The route param is now always the Prisma Container.id (cuid).
  // The Docker container ID is an internal detail stored in record.containerId.
  const dbId = event.params.containerId;
  const userId = session.user.id;

  console.log('[page.server] dbId:', dbId, '| userId:', userId);

  const record = await prisma.container.findFirst({
    where: { id: dbId, userId },
    select: { containerId: true, status: true }
  });

  console.log('[page.server] DB record:', record);

  return {
    user: session.user,
    // The actual Docker container ID — used by the client for all Docker API calls
    dockerContainerId: record?.containerId ?? null
>>>>>>> main
  };
};
