import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";
import { readFile } from "$lib/server/docker/user/read-file";

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
  attachedFiles?: { path: string; name: string }[];  // Array of attached file objects
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

// Check if the user is asking about file contents
function isAskingAboutFileContents(message: string): boolean {
  const contentPatterns = [
    /\b(what('s| is| are)|tell|show|read)\s+(me\s+)?(the\s+)?(content|contents|inside)\b/i,
    /\bwhat('s| is)?\s+in\s+(file|this|these)\b/i,
    /\b(show|tell|what)\s+me\s+(file|files)\b/i,
    /\b(can|could)\s+you\s+(read|show|tell)\s+(me\s+)?/i,
    /\blist\s+(me\s+)?(the\s+)?(files?|content)/i,
    /\bwhat\s+does\s+(file|this)\s+(do|contain|have)/i,
    /\bexplain\s+(file|this)\b/i,
    /\bdescribe\s+(file|this)\b/i,
    /\bwhat\s+is\s+(this|file)\b/i,
  ];
  
  return contentPatterns.some((pattern) => pattern.test(message));
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
function buildPrompt(message: string, context: string, level: number = 1, fileContents?: { path: string; name: string; content: string }[]): string {
  const progress = extractProgressFromContext(context);
  
  console.log("------------------------test--------------------");
  console.log("file contents: ", fileContents);

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

══════════════════════════════════════════════════════════════
ABSOLUTE STRICT RULES - VIOLATION WILL NOT BE TOLERATED:
══════════════════════════════════════════════════════════════

1. NEVER WRITE CODE - This is the most important rule
   - Do NOT write any code in your response
   - Do NOT include code blocks (\`\`\` or <code>)
   - Do NOT provide code snippets or examples
   - Do NOT show function definitions, variable declarations, or any syntax
   - Even if the user asks "what is this file", describe it in WORDS only

2. When asked about files, describe in plain English ONLY:
   - Instead of: "The file has a function called handleClick() that..."
   - Say: "This file has a function that handles click events. It takes user input and processes it."
   - Never show: function handleClick() { ... } or any code syntax

3. Answer EXACTLY what the user asks:
   - If they ask what a file contains, describe it in words
   - If they ask what a function does, explain it in plain English
   - If they ask how something works, explain conceptually
   - Do NOT assume they want code - they probably just want to understand

4. If they ask for a hint on a task:
   - Be SPECIFIC about what to do - name specific files, functions, or areas
   - Give concrete next steps they can take
   - If you know which file needs changes, tell them exactly which file
   - Don't just say "look at the files" - tell them WHICH file to look at
   - Help them understand the task requirements clearly

${handHoldingInstructions}

══════════════════════════════════════════════════════════════
ABSOLUTE STRICT RULES - VIOLATION WILL NOT BE TOLERATED:
══════════════════════════════════════════════════════════════

1. NEVER WRITE CODE - This is the most important rule
   - Do NOT write any code in your response
   - Do NOT include code blocks (\`\`\` or <code>)
   - Do NOT provide code snippets or examples
   - Do NOT show function definitions, variable declarations, or any syntax
   - Even if the user asks "what is this file", describe it in WORDS only

2. When asked about files, describe in plain English ONLY:
   - Instead of: "The file has a function called handleClick() that..."
   - Say: "This file has a function that handles click events. It takes user input and processes it."
   - Never show: function handleClick() { ... } or any code syntax

3. Answer EXACTLY what the user asks:
   - If they ask what a file contains, describe it in words
   - If they ask what a function does, explain it in plain English
   - If they ask how something works, explain conceptually
   - Do NOT assume they want code - they probably just want to understand

4. If they ask for a hint on a task:
   - Be SPECIFIC about what to do - name specific files, functions, or areas
   - Give concrete next steps they can take
   - If you know which file needs changes, tell them exactly which file
   - Don't just say "look at the files" - tell them WHICH file to look at
   - Help them understand the task requirements clearly

USER'S QUESTION: "${message}"

${fileContents && fileContents.length > 0 ? `
ATTACHED FILES (explicitly attached by user for additional context):
${fileContents.map(f => `=== ${f.name} ===\n${f.content}`).join('\n\n')}
` : ''}YOUR TASK:
When the user asks about files (like "what is in this file", "describe this file", "what does this file do", etc.), you MUST read and analyze the actual content of each file provided and describe:
- What the file contains (its actual code/functions/structure)
- What specific functionality it provides
- How the code works (in plain English, no code snippets)
- Any important details specific to THIS file's content

DO NOT give generic descriptions like "This file is part of a Next.js project" - instead, describe the ACTUAL content. For example:
- WRONG: "This file is the main entry point of the application"
- CORRECT: "This file contains the main React component that renders the homepage. It imports a Button component and a Layout component, and displays a welcome message."

For each file, be specific about what the actual code does. If a file contains a function called handleSubmit, describe what handleSubmit does. If it imports certain modules, mention them.

Example of CORRECT answer (based on actual file content):
"The file App.tsx is the main React component. It imports Button and Layout components. The component renders a navigation bar with links to Dashboard, Books, Members, and BorrowRecords pages. It also displays a welcome message and uses React Router for navigation."

Keep your answer concise but include specific details from the file contents.`;
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
    const { message, context, containerId, userId: uid, hintType, attachedFilesCount = 0, attachedFiles, level = 1 } = body;
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

    // Always use AI for hints - the AI is smart enough to handle progress questions
    // and gives better, more contextual answers than the generic function
    // The generic progress response is disabled to ensure AI generates specific hints

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

    console.log("Attached files length: ", attachedFiles?.length);

    // Check if user is asking about files in workspace - fetch relevant files automatically
    let fileContentsForPrompt: { path: string; name: string; content: string }[] | undefined;
    const isFileQuestion = isAskingAboutFileContents(message);
    
    console.log("[AI Hint] Is file question:", isFileQuestion, "Message:", message);
    
    if (isFileQuestion && containerId) {
      // User is asking about files - fetch relevant files from workspace
      try {
        // First, get the list of files in the workspace
        const listRes = await fetch(`/api/docker/container/${containerId}/files/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        const listData = await listRes.json();
        
        console.log("[AI Hint] File list response:", listData);
        
        if (listData.success && listData.files && listData.files.length > 0) {
          // Filter for source files - include more extensions and increase limit
          const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.vue', '.py', '.java', '.go', '.rs', '.json', '.html', '.css', '.md', '.txt'];
          const sourceFiles = listData.files.filter((f: string) => 
            sourceExtensions.some(ext => f.endsWith(ext)) &&
            !f.includes('node_modules/') &&
            !f.includes('.git/') &&
            !f.includes('dist/') &&
            !f.includes('build/')
          ).slice(0, 20); // Increased to 20 files for better context
          
          console.log("[AI Hint] Source files to read:", sourceFiles);
          
          // Read the contents of these files
          fileContentsForPrompt = [];
          for (const filePath of sourceFiles) {
            try {
              const filePathFull = `/workspace/${filePath}`;
              const fileContent = await readFile(filePathFull, containerId);
              console.log("[AI Hint] File read result:", filePath, fileContent.error ? "Error" : "Success");
              if (!fileContent.error && fileContent.content) {
                fileContentsForPrompt.push({
                  path: filePath,
                  name: filePath.split('/').pop() || filePath,
                  content: fileContent.content
                });
              }
            } catch (e) {
              console.log("Error reading file", filePath, e);
            }
          }
          console.log("[AI Hint] Auto-fetched files for context:", fileContentsForPrompt.length, "files");
        }
      } catch (e) {
        console.log("Error fetching file list:", e);
      }
    }

    let prompt: string;
    if (attachedFiles && attachedFiles.length > 0) {
      console.log("[AI Hint] Reading explicitly attached files:", attachedFiles.length);
      const fileContents: { path: string; name: string; content: string }[] = [];
      for (const file of attachedFiles) {
        const filePath = `/workspace/${file.path}`;
        const fileContent = await readFile(filePath, containerId);
        console.log("[AI Hint] Attached file read result:", file.path, fileContent.error ? "Error" : "Success");
        if (!fileContent.error && fileContent.content) {
          fileContents.push({
            path: file.path,
            name: file.name,
            content: fileContent.content
          });
        }
      }
      console.log("[AI Hint] File contents read:", fileContents.length, "files");

      // Build the prompt with level-aware instructions
      prompt = buildPrompt(message, context || "No additional context", currentLevel, fileContents);
    } else if (fileContentsForPrompt && fileContentsForPrompt.length > 0) {
      // Use auto-fetched files for file questions
      console.log("[AI Hint] Using auto-fetched files:", fileContentsForPrompt.length);
      prompt = buildPrompt(message, context || "No additional context", currentLevel, fileContentsForPrompt);
    } else {
      // Build the prompt with level-aware instructions (no attached files)
      console.log("[AI Hint] No files attached or auto-fetched - using context only");
      prompt = buildPrompt(message, context || "No additional context", currentLevel);
    }

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
          max_tokens: 300,
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
