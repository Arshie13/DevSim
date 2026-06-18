import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";
import { toTopicKey } from "$lib/data/assessmentTopics";

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
      const topicKey = toTopicKey(topic);

      return prisma.assessment_topic_score.upsert({
        where: {
          user_id_topic: {
            user_id: userId,
            topic: topicKey,
          },
        },
        update: {
          pre_score: score as number,
          assessed_at: new Date(),
        },
        create: {
          id: `${userId}_${topicKey}_pre`,
          user_id: userId,
          topic: topicKey,
          pre_score: score as number,
          assessed_at: new Date(),
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