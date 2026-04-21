import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/client";

export const load = async (event) => {
  const session = await event.locals.auth();
  
  if (!session?.user?.id) {
    // Not authenticated, redirect to login
    throw redirect(303, '/login');
  }
  
  // Check if user has any pretest scores in the database
  const pretestScores = await prisma.assessmentTopicScore.findMany({
    where: {
      userId: session.user.id,
      preScore: { not: null },
    },
    take: 1,
  });
  
  const hasCompletedPretest = pretestScores.length > 0;
  
  // Redirect based on pretest completion status
  if (hasCompletedPretest) {
    // User has pretest scores, redirect to dashboard
    throw redirect(303, '/dashboard');
  } else {
    // User has no pretest scores, redirect to pretest
    throw redirect(303, '/pretest');
  }
};