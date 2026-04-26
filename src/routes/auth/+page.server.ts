import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/client";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  
  if (!session?.user?.id) {
    // Not authenticated, redirect to login
    throw redirect(303, '/login');
  }
  
  // Check if user has any pretest scores in the database
  const pretestScores = await prisma.assessment_topic_score.findMany({
    where: {
      user_id: session.user.id,
      pre_score: { not: null },
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