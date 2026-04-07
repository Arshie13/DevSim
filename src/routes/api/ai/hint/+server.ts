import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/client";
import { readFile } from "$lib/server/docker/user/read-file";
import {
  isAskingForCode,
  isAskingAboutFileContents,
  isGreeting,
  buildGreetingResponse,
  buildPrompt,
} from "$lib/ai";

const QUICK_HINT_COST = 100;
const CHAT_HINT_COST = 200;
const ATTACHED_FILE_COST = 15;

interface HintRequest {
  message: string;
  context: string;
  containerId: string;
  userId: string;
  hintType?: 'quick' | 'chat';
  model?: string;
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
    const { message, context, containerId, userId: uid, hintType, model, attachedFilesCount = 0, attachedFiles, level = 1 } = body;
    userId = uid;
    const currentLevel = level || 1;

    const hintCost = hintType === 'chat' ? CHAT_HINT_COST : QUICK_HINT_COST;
    const fileCost = (attachedFilesCount || 0) * ATTACHED_FILE_COST;
    const totalCost = hintCost + fileCost;

    if (!message || message.trim().length === 0) {
      return json({ success: false, error: "Message is required" }, { status: 400 });
    }

    if (isAskingForCode(message)) {
      return json({
        success: true,
        hint: "⚠️ Out of Scope: I can only provide hints and guidance, not code solutions. I'm here to help you learn by figuring things out yourself. Try asking for a hint instead!",
        isWarning: true,
        coinsSpent: 0,
        coinsRemaining: 0,
      });
    }

    if (hintType !== 'quick' && isGreeting(message)) {
      let coinBalance = 0;
      if (userId) {
        try {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          coinBalance = user?.coins ?? 0;
        } catch (e) {}
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

    if (!userId) {
      return json({
        success: false,
        error: "Please log in to use AI hints. You need coins to use this feature.",
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return json({ success: false, error: "User not found. Please log in again." });
    }

    if (user.coins < totalCost) {
      return json({
        success: false,
        error: `Insufficient coins! You need ${totalCost} coins (${hintCost} hint + ${fileCost} for ${attachedFilesCount} file(s)). You have ${user.coins} coins. Complete tasks or level up to earn more coins!`,
        coinsRemaining: user.coins,
        hintCost: totalCost,
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { coins: user.coins - totalCost },
    });

    coinsDeducted = true;
    const newCoinBalance = user.coins - totalCost;
    originalCoinBalance = user.coins;

    let fileContentsForPrompt: { path: string; name: string; content: string }[] | undefined;
    const isFileQuestion = isAskingAboutFileContents(message);

    if (isFileQuestion && containerId) {
      try {
        const listRes = await fetch(`/api/docker/container/${containerId}/files/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        const listData = await listRes.json();

        console.log("[AI Hint] File list response:", listData);

        if (listData.success && listData.files && listData.files.length > 0) {
          const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.vue', '.py', '.java', '.go', '.rs', '.json', '.html', '.css', '.md', '.txt'];
          const sourceFiles = listData.files.filter((f: string) =>
            sourceExtensions.some(ext => f.endsWith(ext)) &&
            !f.includes('node_modules/') &&
            !f.includes('.git/') &&
            !f.includes('dist/') &&
            !f.includes('build/')
          ).slice(0, 2);

          console.log("[AI Hint] Source files to read:", sourceFiles);

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
          fileContents.push({ path: file.path, name: file.name, content: fileContent.content });
        }
      }
      console.log("[AI Hint] File contents read:", fileContents.length, "files");
      prompt = buildPrompt(message, context || "No additional context", currentLevel, fileContents);
    } else if (fileContentsForPrompt && fileContentsForPrompt.length > 0) {
      console.log("[AI Hint] Using auto-fetched files:", fileContentsForPrompt.length);
      prompt = buildPrompt(message, context || "No additional context", currentLevel, fileContentsForPrompt);
    } else {
      console.log("[AI Hint] No files attached or auto-fetched - using context only");
      prompt = buildPrompt(message, context || "No additional context", currentLevel);
    }

    // Try models (OpenRouter and direct Google Gemini)
    const defaultModels = [
      "nvidia/nemotron-3-nano-30b-a3b:free",
      "google/gemma-3n-e2b-it:free",
      "qwen/qwen3.6-plus:free",
      "nvidia/nemotron-3-super-120b-a12b:free",
      "google/gemini-2.5-flash:direct"
    ];

    const models = model
      ? [model, ...defaultModels.filter((m) => m !== model)]
      : defaultModels;

    let response = null;
    let lastError = null;

    for (const model of models) {
      console.log(`Trying model: ${model}`);

      if (model === "google/gemini-2.5-flash:direct") {
        // Use Google Gemini API directly
        const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!geminiApiKey) {
          console.log("Google Gemini API key not configured");
          continue;
        }

        try {
          const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7
              }
            }),
          });

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            // Convert Gemini response to OpenRouter format
            response = {
              ok: true,
              json: async () => ({
                choices: [{
                  message: {
                    content: geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No response"
                  }
                }]
              })
            };
            console.log(`Google Gemini model succeeded`);
            break;
          } else {
            const errorData = await geminiResponse.json();
            console.log(`Google Gemini failed:`, errorData);
            lastError = errorData;
            continue;
          }
        } catch (error) {
          console.log(`Google Gemini error:`, error);
          lastError = error;
          continue;
        }
      } else {
        // Use OpenRouter
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
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200,
            temperature: 0.7,
            reasoning: { "enabled": false }
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
    }

    if (!response || !response.ok) {
      console.error("All models failed. Last error:", lastError);

      if (coinsDeducted) {
        await prisma.user.update({
          where: { id: userId },
          data: { coins: originalCoinBalance },
        });
      }

      return json({
        success: false,
        error: `Failed to get response from AI: ${lastError?.error?.message || lastError?.message || "All models unavailable"}. Your coins have been refunded. Please try again.`,
      });
    }

    const data = await response.json();

    const hint = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a hint. Please try again.";

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
          data: { coins: originalCoinBalance },
        });
      } catch (refundError) {
        console.error("Error refunding coins:", refundError);
      }
    }

    return json({ success: false, error: "Failed to generate hint" }, { status: 500 });
  }
};
