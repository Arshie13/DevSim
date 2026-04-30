import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/client";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  
  if (!session?.user?.id) {
    // Not authenticated, redirect to login
    throw redirect(303, '/login');
  }
  
  // Check if user has completed pretest
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { pretest_score: true },
  });
  
  const hasCompletedPretest = user?.pretest_score != null;
  
  // Redirect based on pretest completion status
  if (hasCompletedPretest) {
    // User has pretest scores, redirect to dashboard
    throw redirect(303, '/dashboard');
  } else {
    // User has no pretest scores, redirect to pretest
    throw redirect(303, '/pretest');
  }
};