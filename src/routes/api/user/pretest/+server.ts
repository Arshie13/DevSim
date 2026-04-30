import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.auth();
  
  if (!session?.user?.id) {
    throw error(401, "Unauthorized");
  }
  
  try {
    const body = await request.json();
    const { scores, skillLevel, averageScore } = body;
    
    if (!scores || typeof scores !== 'object') {
      throw error(400, "Invalid scores format");
    }
    
    const userId = session.user.id;
    
    // Save pretest score to user
    await prisma.user.update({
      where: { id: userId },
      data: { pretest_score: Math.round(averageScore) },
    });
    
    console.log("Pre-test score saved for user:", userId, { averageScore, skillLevel });
    
    return json({
      success: true,
      message: "Pre-test score saved successfully",
      skillLevel,
      averageScore
    });
  } catch (err) {
    console.error("Error saving pre-test scores:", err);
    throw error(500, "Failed to save pre-test scores");
  }
};