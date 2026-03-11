import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";

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
  hintType?: 'quick' | 'chat';
  level?: number;  // User's current level (1-5)
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

// Check if the user is greeting
function isGreeting(message: string): boolean {
  const greetingPatterns = [
    /^\s*(hi|hello|hey|howdy|hiya|yo|sup|what's up|what up|greetings)\s*$/i,
    /^\s*(hi|hello|hey|howdy|hiya|yo|sup|what's up|what up|greetings)\s*!.*$/i,
    /^\s*(good morning|good afternoon|good evening)\s*$/i,
    /^\s*thanks for joining/i,
    /^\s*i('m| am)\s+new/i,
    /^\s*(start|begin|ready|lets|let us)\s+(go|start|begin)/i,
  ];
  
  return greetingPatterns.some((pattern) => pattern.test(message));
}

// Extract progress information from context
function extractProgressFromContext(context: string): { completed: number; total: number; tasks: string[] } {
  const taskMatch = context.match(/Tasks? \((\d+)\/(\d+) completed\):/);
  const completed = taskMatch ? parseInt(taskMatch[1]) : 0;
  const total = taskMatch ? parseInt(taskMatch[2]) : 0;
  
  const taskLines: string[] = [];
  const taskRegex = /\[([ √])\]\s+(.+)/g;
  let match;
  while ((match = taskRegex.exec(context)) !== null) {
    taskLines.push(`${match[1] === '√' ? '[✓]' : '[ ]'} ${match[2]}`);
  }
  
  return { completed, total, tasks: taskLines };
}

// Build a friendly greeting response
function buildGreetingResponse(context: string): string {
  const progress = extractProgressFromContext(context);
  
  let response = "👋 Hello! I'm SAZ, your AI coding assistant for StudentHub! ";
  
  if (progress.total > 0) {
    response += `I can see you're working on a project with ${progress.total} tasks, and you've completed ${progress.completed} of them. `;
    
    if (progress.completed === 0) {
      response += "That's great - you're just getting started! ";
    } else if (progress.completed < progress.total) {
      response += "Keep up the good progress! ";
    } else {
      response += "Amazing! You've completed all tasks! ";
    }
  }
  
  response += "\n\nHere's how I can help:\n";
  response += "• 📝 Ask me for hints when you're stuck\n";
  response += "• 💡 Get guidance on your current task\n";
  response += "• 🔍 Help you understand code or concepts\n";
  response += "• 🎯 Point you in the right direction\n\n";
  response += "Feel free to ask me anything!";
  
  return response;
}

// Check if the user is asking about their progress
function isAskingAboutProgress(message: string): boolean {
  const progressPatterns = [
    /\b(how\s+(am\s+)?i|what('s| is)\s+my)\s+(progress|status|doing)\b/i,
    /\b(what|which)\s+(task|step)\s+(next|should|am)\b/i,
    /\b(where|how)\s+(should\s+)?i\s+(start|begin|focus)\b/i,
    /\b(show|tell)\s+me\s+(the\s+)?(tasks?|progress|status)\b/i,
    /\bwhat\s+(do|should)\s+i\s+do\s+next/i,
    /\bnext\s+step/i,
    /\b(stuck|confused|need\s+help)\b/i,
    /\b(tell|give)\s+me\s+(a\s+)?hint/i,
    /\bhint\b/i,
  ];
  
  return progressPatterns.some((pattern) => pattern.test(message));
}

// Build a hint response based on user's progress
function buildProgressHintResponse(context: string): string {
  const progress = extractProgressFromContext(context);

  console.log("progress: ", progress);
  
  if (progress.total === 0 && progress.tasks.length === 0) {
    return "I don't see any tasks in your context yet. Try opening a project or loading a scenario first!";
  }
  
  const nextTask = progress.tasks.find(task => task.startsWith('[ ]'));
  
  let response = "📋 Here's your current progress: ";
  response += `${progress.completed}/${progress.total} tasks completed.\n\n`;
  
  if (nextTask) {
    response += "🎯 **Next Task:**\n";
    response += nextTask.replace('[ ]', '').trim() + "\n\n";
    response += "💡 **Hint:** Look at the task description and check the files in your project. ";
    
    const taskText = nextTask.toLowerCase();
    if (taskText.includes('install') || taskText.includes('npm') || taskText.includes('package')) {
      response += "You may need to run some installation commands in the terminal.";
    } else if (taskText.includes('create') || taskText.includes('add') || taskText.includes('file')) {
      response += "Try creating or modifying files in the explorer.";
    } else if (taskText.includes('run') || taskText.includes('start') || taskText.includes('test')) {
      response += "Check if there's a terminal or command to run.";
    } else if (taskText.includes('error') || taskText.includes('fix') || taskText.includes('debug')) {
      response += "Look at the error messages for clues on what to fix.";
    } else {
      response += "Break down the task into smaller steps and tackle them one at a time.";
    }
  } else {
    response += "🎉 Congratulations! You've completed all tasks! ";
    if (progress.completed === progress.total && progress.total > 0) {
      response += "Great job! You can submit your work or move on to the next level.";
    }
  }
  
  return response;
}

// Build the prompt for AI models
function buildPrompt(message: string, context: string, level: number = 1): string {
  const progress = extractProgressFromContext(context);
  
  // Determine hand-holding level based on user progression
  // Levels 1-2: Give step-by-step guidance (hand-holdy)
  // Levels 3-5: Encourage thinking (less hand-holdy)
  const isHandHoldy = level <= 2;
  
  const handHoldingInstructions = isHandHoldy ? `
YOUR TEACHING STYLE - BE HAND-HOLDY (Level ${level}):
- Give step-by-step instructions on exactly what to do
- Break down tasks into small, actionable steps
- Explain each step clearly like teaching a beginner
- Provide specific file names, function names, or code patterns to look for
- If they're stuck, guide them through the exact process
` : `
YOUR TEACHING STYLE - LESS HAND-HOLDY (Level ${level}):
- Provide hints and guidance without giving away the answer
- Offer guidance and direction without asking questions
- Point them in the right direction without being too explicit
- Encourage them to figure things out on their own
- Only give big-picture guidance, not step-by-step instructions
`;
  
  return `You are SAZ, a friendly and helpful coding assistant for StudentHub, a learning platform where students complete coding projects.

CURRENT USER PROGRESS:
- Tasks completed: ${progress.completed} out of ${progress.total}
- Current Level: ${level}

RECENT TASKS:
${progress.tasks.slice(0, 5).join('\n')}

${context}

${handHoldingInstructions}

IMPORTANT GUIDELINES:
1. Your name is SAZ - always identify yourself as such
2. ALWAYS reference the user's actual progress and tasks when responding
3. If they ask for a hint, analyze their code and tell them exactly what to do for their NEXT incomplete task
4. Look at the code files to understand what they've built - don't give generic advice
5. NEVER write actual code - only provide hints and guidance
6. NEVER ask questions in your responses - always provide direct statements and guidance
7. Be encouraging and supportive
8. Keep responses concise but specific (2-4 sentences)

${handHoldingInstructions}

IMPORTANT GUIDELINES:
1. Your name is SAZ - always identify yourself as such
2. ALWAYS reference the user's actual progress and tasks when responding
3. If they ask for a hint, analyze their code and tell them exactly what to do for their NEXT incomplete task
4. Look at the code files to understand what they've built - don't give generic advice
5. NEVER write actual code - only provide hints and guidance
6. NEVER ask questions in your responses - always provide direct statements and guidance
7. Be encouraging and supportive
8. Keep responses concise but specific (2-4 sentences)

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
    const { message, context, userId: uid, hintType, attachedFilesCount = 0, level = 1 } = body;
    userId = uid;
    const currentLevel = level || 1;

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

    // Check if user is asking for code
    if (isAskingForCode(message)) {
      return json({
        success: true,
        hint: "⚠️ Out of Scope: I can only provide hints and guidance, not code solutions. I'm here to help you learn by figuring things out yourself. Try asking for a hint instead!",
        isWarning: true,
        coinsSpent: 0,
        coinsRemaining: 0,
      });
    }

    // Check if user is greeting - respond warmly (skip for quick hints to use AI)
    if (hintType !== 'quick' && isGreeting(message)) {
      let coinBalance = 0;
      if (userId) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
          });
          coinBalance = user?.coins ?? 0;
        } catch (e) {
          // Ignore errors
        }
      }
      const greetingResponse = buildGreetingResponse(context || "No additional context");
      return json({
        success: true,
        hint: greetingResponse,
        isGreeting: true,
        coinsSpent: 0,
        coinsRemaining: coinBalance,
      });
    }

    // Check if user is asking about progress (skip for quick hints to use AI)
    if (hintType !== 'quick' && isAskingAboutProgress(message)) {
      let coinBalance = 0;
      if (userId) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
          });
          coinBalance = user?.coins ?? 0;
        } catch (e) {
          // Ignore errors
        }
      }
      const progressResponse = buildProgressHintResponse(context || "No additional context");
      return json({
        success: true,
        hint: progressResponse,
        isProgressUpdate: true,
        coinsSpent: 0,
        coinsRemaining: coinBalance,
      });
    }

    // Validate userId for full AI responses
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

    // Deduct coins
    await prisma.user.update({
      where: { id: userId },
      data: {
        coins: user.coins - totalCost,
      },
    });

    coinsDeducted = true;
    const newCoinBalance = user.coins - totalCost;
    originalCoinBalance = user.coins;

    // Build the prompt with level-aware instructions
    const prompt = buildPrompt(message, context || "No additional context", currentLevel);

    // Try OpenRouter free coding models
    const models = [
      "meta-llama/llama-3.1-8b-instruct",
      "google/gemma-2-9b-it",
      "mistralai/mistral-7b-instruct-v0.2"
    ];

    let response = null;
    let lastError = null;

    for (const model of models) {
      console.log(`Trying OpenRouter model: ${model}`);
      
      const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
      
      const modelResponse = await fetch(openRouterUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://devsim.com",
          "X-Title": "DevSim AI Hints"
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
        
        if (modelResponse.status === 429 || modelResponse.status === 404) {
          continue;
        } else {
          break;
        }
      }
    }

    // If all models failed
    if (!response || !response.ok) {
      console.error("All models failed. Last error:", lastError);

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
