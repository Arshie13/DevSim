import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";
import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/sveltekit/providers/google";

// AI Hint costs in coins
const QUICK_HINT_COST = 100;  // Button-triggered hints based on progress
const CHAT_HINT_COST = 200;    // Full chat with conversation history
const ATTACHED_FILE_COST = 15;  // Cost per attached file

// Interface for the request body
interface HintRequest {
  message: string;
  context: string;
  containerId: string;
  userId: string;
  hintType?: 'quick' | 'chat';  // Optional hint type
  attachedFilesCount?: number;  // Number of files attached to the message
}

// Check if the user is asking for code
function isAskingForCode(message: string): boolean {
  const codePatterns = [
    /\b(write|create|generate|build|make|implement)\s+(code|the|a|an|some|me)\b/i,
    /\b(give|show|provide)\s+(me\s+)?(the\s+)?(code|solution|answer)\b/i,
    /\b(code|solution|answer)\s+(please|now|for me)\b/i,
    /```/,
    /<code>/,
    /function\s+\w+\s*\(/,
    /const\s+\w+\s*=/,
    /let\s+\w+\s*=/,
    /import\s+.*from/,
    /export\s+(default\s+)?(function|class|const)/,
  ];

  return codePatterns.some((pattern) => pattern.test(message));
}

// Build the prompt for OpenRouter
function buildPrompt(message: string, context: string): string {
  return `You are an expert coding mentor working with a DevSim interactive coding environment.

PROJECT CONTEXT:
${context}

USER'S QUESTION: "${message}"

YOUR TASK:
Analyze the user's question and the project files/code provided above. Then give a helpful, moderately detailed hint that:
1. Directly addresses what the user is asking about
2. Explains the key concept or approach
3. References specific code or patterns from the files shown
4. Gives a clear next step

IMPORTANT:
- Do NOT describe the project generally (like "this seems to be a React app")
- Do NOT give generic advice that could apply to any project
- Instead, say things like "In file X, function Y does Z, so you should..."
- Do NOT write any code - just explain what to do
- Keep your answer concise but informative (2-5 sentences)
- Use bullet points if needed for clarity

If the user asks something unrelated to the files, give a brief relevant hint.`;
}

export const POST: RequestHandler = async ({ request }) => {
  // Check if API key is configured FIRST to avoid unnecessary database queries
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "your_openrouter_api_key_here") {
    return json({
      success: false,
      error: "OPENROUTER_API_KEY is not configured. Please add it to your .env file. Get one free at https://openrouter.ai",
    });
  }

  let coinsDeducted = false;
  let userId = "";
  let originalCoinBalance = 0;

  try {
    const body: HintRequest = await request.json();
    const { message, context, userId: uid, hintType, attachedFilesCount = 0 } = body;
    userId = uid;

    // Determine base cost based on hint type
    const hintCost = hintType === 'chat' ? CHAT_HINT_COST : QUICK_HINT_COST;
    
    // Calculate total cost including attached files
    const fileCost = (attachedFilesCount || 0) * ATTACHED_FILE_COST;
    const totalCost = hintCost + fileCost;

    if (!message || message.trim().length === 0) {
      return json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // Check if user is asking for code - no coins needed for warnings
    if (isAskingForCode(message)) {
      return json({
        success: true,
        hint: "⚠️ Out of Scope: I can only provide hints and guidance, not code solutions. I'm here to help you learn by figuring things out yourself. Try asking for a hint instead!",
        isWarning: true,
        coinsSpent: 0,
        coinsRemaining: 0,
      });
    }

    // Validate userId
    if (!userId) {
      return json({
        success: false,
        error: "Please log in to use AI hints. You need coins to use this feature.",
      });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return json({
        success: false,
        error: "User not found. Please log in again.",
      });
    }

    // Check if user has enough coins (including attached file costs)
    if (user.coins < totalCost) {
      return json({
        success: false,
        error: `Insufficient coins! You need ${totalCost} coins (${hintCost} hint + ${fileCost} for ${attachedFilesCount} file(s)). You have ${user.coins} coins. Complete tasks or level up to earn more coins!`,
        coinsRemaining: user.coins,
        hintCost: totalCost,
      });
    }

    // Deduct coins ONLY after all validations pass
    await prisma.user.update({
      where: { id: userId },
      data: {
        coins: user.coins - totalCost,
      },
    });

    coinsDeducted = true;
    const newCoinBalance = user.coins - totalCost;
    originalCoinBalance = user.coins;

    // Build the prompt
    const prompt = buildPrompt(message, context || "No additional context");

    // List of OpenRouter FREE models good at coding (fallback mechanism)
    const models = [
      "meta-llama/llama-3.1-8b-instruct",  // Free: Meta's capable model
      "google/gemma-2-9b-it",               // Free: Google's efficient model
      "qwen/Qwen2-7B-Instruct",             // Free: Good at code tasks
    ];

    let response = null;
    let lastError = null;

    // Try each model in sequence until one succeeds
    for (const model of models) {
      console.log(`Trying OpenRouter model: ${model}`);
      
      const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
      
      const modelResponse = await fetch(openRouterUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://devsim.app",
          "X-Title": "DevSim",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 768,
          temperature: 0.7,
        }),
      });

      if (modelResponse.ok) {
        response = modelResponse;
        console.log(`OpenRouter model ${model} succeeded`);
        break;
      } else {
        const errorData = await modelResponse.json();
        console.log(`Model ${model} failed:`, errorData);
        lastError = errorData;
        
        // If it's a rate limit error (429) or model not found (404), try next model
        if (modelResponse.status === 429 || modelResponse.status === 404) {
          continue;
        } else {
          // For other errors, don't retry
          break;
        }
      }
    }

    // If all models failed
    if (!response || !response.ok) {
      console.error("All models failed. Last error:", lastError);

      // Refund coins on API error
      if (coinsDeducted) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            coins: originalCoinBalance,
          },
        });
      }

      return json({
        success: false,
        error: `Failed to get response from AI: ${lastError?.error?.message || lastError?.message || "All models unavailable"}. Your coins have been refunded. Please try again.`,
      });
    }

    const data = await response.json();

    // Extract the response text
    const hint = data.choices?.[0]?.message?.content ||
                  "Sorry, I couldn't generate a hint. Please try again.";

    return json({
      success: true,
      hint: hint.trim(),
      coinsSpent: totalCost,
      coinsRemaining: newCoinBalance,
    });
  } catch (error) {
    console.error("Error generating hint:", error);

    // Refund coins if they were deducted and an error occurred
    if (coinsDeducted && userId) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            coins: originalCoinBalance,
          },
        });
      } catch (refundError) {
        console.error("Error refunding coins:", refundError);
      }
    }

    return json(
      { success: false, error: "Failed to generate hint" },
      { status: 500 }
    );
  }
};
