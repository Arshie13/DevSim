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
    
    // Save each topic score to the database
    const scorePromises = Object.entries(scores).map(([topic, score]) => {
      const topicKey = topic.toLowerCase().replace(/\s+/g, '_');
      
      return prisma.assessmentTopicScore.upsert({
        where: {
          userId_topic: {
            userId,
            topic: topicKey,
          },
        },
        update: {
          preScore: score as number,
          assessedAt: new Date(),
        },
        create: {
          id: `${userId}_${topicKey}_pre`,
          userId,
          topic: topicKey,
          preScore: score as number,
          assessedAt: new Date(),
        },
      });
    });
    
    await Promise.all(scorePromises);
    
    console.log("Pre-test scores saved for user:", userId, { scores, skillLevel, averageScore });
    
    return json({ 
      success: true, 
      message: "Pre-test scores saved successfully",
      skillLevel,
      averageScore
    });
  } catch (err) {
    console.error("Error saving pre-test scores:", err);
    throw error(500, "Failed to save pre-test scores");
  }
};