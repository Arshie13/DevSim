import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import prisma from "$lib/server/client";

// AI endpoint for grading reflections
const AI_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const AI_API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

interface ReflectionData {
  topic: string;
  concepts: string[];
  explanation: string;
}

// Grade user's reflection using AI
async function gradeReflectionWithAI(reflections: ReflectionData[], preScores: Record<string, number>): Promise<{
  grades: Record<string, { score: number; feedback: string }>;
  overallScore: number;
  improvement: string;
}> {
  console.log("gradeReflectionWithAI called with", reflections.length, "reflections");
  console.log("AI_API_KEY present:", !!AI_API_KEY);

  if (!AI_API_KEY || reflections.length === 0) {
    // Fallback if no API key - length-based grading
    const grades: Record<string, { score: number; feedback: string }> = {};
    let totalScore = 0;
    
    for (const r of reflections) {
      const explanation = r.explanation.trim().toLowerCase();
      const isSubstantive = explanation.length > 20 && !['sample', 'test', 'none', 'good', 'okay', 'ok', 'nice'].includes(explanation);
      
      let score: number;
      let feedback: string;
      
      if (explanation.length < 10) {
        score = 5;
        feedback = "Response is too short. Please provide more detail about what you learned.";
      } else if (!isSubstantive || explanation.length < 50) {
        score = 25;
        feedback = "Please provide more specific details about the concepts you learned.";
      } else if (explanation.length < 100) {
        score = 50;
        feedback = "Good effort, but try to include more specific examples.";
      } else if (explanation.length < 200) {
        score = 70;
        feedback = "Good explanation with some detail.";
      } else {
        score = 85;
        feedback = "Excellent detailed reflection!";
      }
      
      grades[r.topic] = { score, feedback };
      totalScore += score;
    }
    
    return {
      grades,
      overallScore: reflections.length > 0 ? totalScore / reflections.length : 0,
      improvement: reflections.length > 0 && totalScore / reflections.length > 50 ? "significant" : "minimal"
    };
  }

  // Build prompt for AI to grade
  const reflectionSummary = reflections.map(r => 
    `Topic: ${r.topic}\nConcepts: ${r.concepts.join(", ")}\nUser's Explanation: ${r.explanation}`
  ).join("\n\n");

  const preScoreSummary = Object.entries(preScores).map(([topic, score]) => 
    `${topic}: ${score}/5`
  ).join(", ");

  const prompt = `You are a strict coding instructor evaluating student reflections. Be VERY strict - responses unrelated to the level concepts should get 0 points.

PRE-ASSESSMENT SCORES (before learning):
${preScoreSummary || "No pre-assessment data available"}

STUDENT REFLECTIONS:
${reflectionSummary}

EVALUATION RULES:
1. If the response is empty, "sample", "test", "none", "good", "okay", or single generic words: SCORE 0
2. If the response is unrelated to the topic/concepts listed (e.g., talking about cooking when the topic is about coding): SCORE 0-10
3. If response has some effort but is mostly generic with no technical details: 15-30 points
4. If response shows some understanding but lacks depth: 31-50 points
5. If response has good technical understanding with some specifics: 51-70 points
6. Only if response demonstrates clear understanding of the actual level concepts with specific examples: 71-100 points

IMPORTANT: Give LOW scores (0-25) to anything that doesn't actually discuss the level's concepts. Be skeptical of generic positive responses.

Respond in JSON format:
{
  "grades": {
    "Level 1: Environment Setup": { "score": 0, "feedback": "Your response does not discuss environment setup or related concepts. Please explain what you learned about this specific topic." }
  },
  "overallScore": 0,
  "improvement": "minimal"
}

Only respond with valid JSON.`;

  try {
    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_API_KEY}`,
        "HTTP-Referer": "https://devsim.app",
        "X-Title": "DevSim Post-Assessment"
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        messages: [
          { role: "system", content: "You are an expert coding instructor." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from AI response
    const parsed = JSON.parse(aiResponse);
    
    return {
      grades: parsed.grades || {},
      overallScore: parsed.overallScore || 0,
      improvement: parsed.improvement || "moderate"
    };
  } catch (e) {
    console.error("AI grading error:", e);
    
    // Fallback grading - strict evaluation
    const grades: Record<string, { score: number; feedback: string }> = {};
    let totalScore = 0;
    
    for (const r of reflections) {
      const explanation = r.explanation.trim().toLowerCase();
      const isSubstantive = explanation.length > 20 && !['sample', 'test', 'none', 'good', 'okay', 'ok', 'nice'].includes(explanation);
      
      let score: number;
      let feedback: string;
      
      if (explanation.length < 10) {
        score = 5;
        feedback = "Response is too short. Please provide more detail about what you learned.";
      } else if (!isSubstantive || explanation.length < 50) {
        score = 25;
        feedback = "Please provide more specific details about the concepts you learned.";
      } else if (explanation.length < 100) {
        score = 50;
        feedback = "Good effort, but try to include more specific examples.";
      } else if (explanation.length < 200) {
        score = 70;
        feedback = "Good explanation with some detail.";
      } else {
        score = 85;
        feedback = "Excellent detailed reflection!";
      }
      
      grades[r.topic] = { score, feedback };
      totalScore += score;
    }
    
    return {
      grades,
      overallScore: reflections.length > 0 ? totalScore / reflections.length : 0,
      improvement: reflections.length > 0 && totalScore / reflections.length > 50 ? "significant" : "minimal"
    };
  }
}

export const GET: RequestHandler = async (event) => {
  // Get the authenticated user from session
  const session = await event.locals.auth();
  
  if (!session?.user?.id) {
    // Return empty pre-scores if user is not authenticated
    return json({ preScores: {} });
  }
  
  const userId = session.user.id;
  
  // Fetch pre-assessment scores from database
  const preScoresRecords = await prisma.assessment_topic_score.findMany({
    where: { user_id: userId },
    orderBy: { topic: 'asc' }
  });
  
  // Convert to the format expected by the frontend
  // Frontend expects: { "Level 1: Topic": { pre: number, post: number | null, improvement: number | null } }
  const preScores: Record<string, { pre: number | null; post: number | null; improvement: number | null }> = {};
  for (const record of preScoresRecords) {
    preScores[record.topic] = {
      pre: record.pre_score,
      post: record.post_score,
      improvement: record.improvement
    };
  }
  
  return json(preScores);
};

export const POST: RequestHandler = async (event) => {
  const body = await event.request.json();
  const { scores, reflections, preScores } = body;
  
  console.log("Post-assessment submitted:", { scores, reflections, preScores });
  
  // Grade reflections using AI if explanations are provided
  let aiGrading = null;
  const reflectionsWithExplanations = reflections?.filter((r: ReflectionData) => r.explanation && r.explanation.length > 0);
  
  console.log("Filtering reflections - found:", reflectionsWithExplanations?.length);
  
  if (reflectionsWithExplanations && reflectionsWithExplanations.length > 0) {
    // Convert preScores to number format - handle both formats
    const numericPreScores: Record<string, number> = {};
    if (preScores) {
      for (const [key, value] of Object.entries(preScores)) {
        // Handle format from GET endpoint: { "Level 1: Environment Setup": 2.5 }
        if (typeof value === 'number') {
          numericPreScores[key] = value;
        }
        // Handle format with pre property: { pre: number }
        else if (value && typeof value === 'object' && 'pre' in value) {
          numericPreScores[key] = (value as any).pre || 0;
        }
      }
    }
    
    console.log("Calling AI grading with:", { reflections: reflectionsWithExplanations, preScores: numericPreScores });
    aiGrading = await gradeReflectionWithAI(reflectionsWithExplanations, numericPreScores);
    console.log("AI Grading result:", aiGrading);
  } else {
    console.log("No reflections with explanations found. reflections:", reflections);
  }
  
  // Return success with grading results
  return json({
    success: true,
    aiGrading,
    // Include a flag to indicate if content validation failed - increased threshold for less strict checking
    contentWarning: aiGrading && aiGrading.overallScore <= 5 // Only flag truly nonsense responses (score 5 or below)
  });
};