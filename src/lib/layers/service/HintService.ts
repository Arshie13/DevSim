import { UserDataAccess } from '../data-access/UserDataAccess';
import { ContainerService } from './ContainerService';
import { AIHelpLimitService } from './AIHelpLimitService';

const QUICK_HINT_COST = 100;
const CHAT_HINT_COST = 200;
const ATTACHED_FILE_COST = 15;

interface HintRequest {
  message: string;
  context?: string;
  containerId?: string;
  userId: string;
  hintType: 'quick' | 'chat';
  model?: string;
  attachedFilesCount?: number;
  attachedFiles?: { path: string; name: string }[];
  level?: number;
}

interface HintResult {
  success: boolean;
  hint?: string;
  error?: string;
  isGreeting?: boolean;
  isWarning?: boolean;
  coinsSpent?: number;
  coinsRemaining?: number;
  aiHelpsRemaining?: { today: number; total: number };
  hintCost?: number;
}

export class HintService {
  constructor(
    private readonly userDataAccess = new UserDataAccess(),
    private readonly containerService = new ContainerService(),
    private readonly aiHelpLimitService = new AIHelpLimitService()
  ) {}

  async processHint(request: HintRequest): Promise<HintResult> {
    const {
      message,
      context,
      containerId,
      userId,
      hintType,
      model,
      attachedFilesCount = 0,
      attachedFiles,
      level = 1
    } = request;

    if (!message || message.trim().length === 0) {
      return { success: false, error: 'Message is required' };
    }

    // Check for code requests
    if (this.isAskingForCode(message)) {
      return {
        success: true,
        hint: '⚠️ Out of Scope: I can only provide hints and guidance, not code solutions. I\'m here to help you learn by figuring things out yourself. Try asking for a hint instead!',
        isWarning: true,
        coinsSpent: 0,
        coinsRemaining: 0
      };
    }

    // Handle greetings
    if (hintType !== 'quick' && this.isGreeting(message)) {
      const coinBalance = await this.getUserCoinBalance(userId);
      return {
        success: true,
        hint: this.buildGreetingResponse(context || 'No additional context'),
        isGreeting: true,
        coinsSpent: 0,
        coinsRemaining: coinBalance
      };
    }

    // Verify user exists
    const userResult = await this.userDataAccess.getUserCoins(userId);
    if (!userResult.success || !userResult.user) {
      return { success: false, error: 'User not found. Please log in again.' };
    }

    // Calculate costs
    const hintCost = hintType === 'chat' ? CHAT_HINT_COST : QUICK_HINT_COST;
    const fileCost = attachedFilesCount * ATTACHED_FILE_COST;
    const totalCost = hintCost + fileCost;

     // Check coin balance
     if (userResult.coins < totalCost) {
       return {
         success: false,
         error: `Insufficient coins! You need ${totalCost} coins (${hintCost} hint + ${fileCost} for ${attachedFilesCount} file(s)). You have ${userResult.coins} coins. Complete tasks or level up to earn more coins!`,
         coinsRemaining: userResult.coins,
         hintCost: totalCost
       };
     }

      // Check AI help availability (credits first, then daily limit)
      const consumeResult = await this.aiHelpLimitService.consumeHelp(userId);
      if (!consumeResult.consumed) {
        return {
          success: false,
          error: `Daily AI help limit reached (${consumeResult.dailyRemaining}/${consumeResult.limit}). Your limit will reset at midnight UTC.`,
          coinsRemaining: userResult.coins,
          aiHelpsRemaining: { today: 0, total: consumeResult.limit }
        };
      }

      // Deduct coins
      const deductResult = await this.userDataAccess.deductCoins(userId, totalCost);
      if (!deductResult.success) {
        // Refund AI help credits if we deducted them? Actually consumeHelp already committed.
        // For simplicity, we don't refund AI usage on coin failure.
        return { success: false, error: 'Failed to deduct coins' };
      }
      const newCoinBalance = deductResult.coins;
    const originalCoinBalance = userResult.coins;

    try {
      // Get file contents if needed
      const fileContents = await this.getFileContentsForPrompt(
        message,
        context,
        containerId,
        attachedFiles,
        this.isAskingAboutFileContents(message)
      );

       // Build prompt
       const prompt = this.buildPrompt(message, context || 'No additional context', level, fileContents);

       // Get AI response
       const hint = await this.getAIResponse(prompt, model);

       // Return result — AI help already consumed via consumeHelp()
       return {
         success: true,
         hint: hint.trim(),
         coinsSpent: totalCost,
         coinsRemaining: newCoinBalance,
         aiHelpsRemaining: {
           today: consumeResult.dailyRemaining,
           total: consumeResult.limit
         }
       };
    } catch (error) {
      // Refund coins on error
      await this.userDataAccess.refundCoins(userId, totalCost);
      console.error('Error generating hint:', error);
      return { success: false, error: 'Failed to generate hint' };
    }
  }

  private isAskingForCode(message: string): boolean {
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
      /export\s+(default\s+)?(function|class|const)/
    ];
    return codePatterns.some((pattern) => pattern.test(message));
  }

  private isGreeting(message: string): boolean {
    const greetingPatterns = [
      /^\s*(hi|hello|hey|howdy|hiya|yo|sup|what's up|what up|greetings)\s*$/i,
      /^\s*(hi|hello|hey|howdy|hiya|yo|sup|what's up|what up|greetings)\s*!.*$/i,
      /^\s*(good morning|good afternoon|good evening)\s*$/i,
      /^\s*thanks for joining/i,
      /^\s*i('m| am)\s+new/i,
      /^\s*(start|begin|ready|lets|let us)\s+(go|start|begin)/i
    ];
    return greetingPatterns.some((pattern) => pattern.test(message));
  }

  private isAskingAboutFileContents(message: string): boolean {
    const contentPatterns = [
      /\b(what('s| is| are)|tell|show|read)\s+(me\s+)?(the\s+)?(content|contents|inside)\b/i,
      /\bwhat('s| is)?\s+in\s+(file|this|these)\b/i,
      /\b(show|tell|what)\s+me\s+(file|files)\b/i,
      /\b(can|could)\s+you\s+(read|show|tell)\s+(me\s+)?/i,
      /\blist\s+(me\s+)?(the\s+)?(files?|content)/i,
      /\bwhat\s+does\s+(file|this)\s+(do|contain|have)/i,
      /\bexplain\s+(file|this)\b/i,
      /\bdescribe\s+(file|this)\b/i,
      /\bwhat\s+is\s+(this|file)\b/i
    ];
    return contentPatterns.some((pattern) => pattern.test(message));
  }

  private extractProgressFromContext(context: string): { completed: number; total: number; tasks: string[] } {
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

  private buildGreetingResponse(context: string): string {
    const progress = this.extractProgressFromContext(context);

    let response = '👋 Hello! I\'m SAZ, your AI coding assistant for StudentHub! ';

    if (progress.total > 0) {
      response += `I can see you're working on a project with ${progress.total} tasks, and you've completed ${progress.completed} of them. `;

      if (progress.completed === 0) {
        response += 'That\'s great - you\'re just getting started! ';
      } else if (progress.completed < progress.total) {
        response += 'Keep up the good progress! ';
      } else {
        response += 'Amazing! You\'ve completed all tasks! ';
      }
    }

    response += '\n\nHere\'s how I can help:\n';
    response += '• 📝 Ask me for hints when you\'re stuck\n';
    response += '• 💡 Get guidance on your current task\n';
    response += '• 🔍 Help you understand code or concepts\n';
    response += '• 🎯 Point you in the right direction\n\n';
    response += 'Feel free to ask me anything!';

    return response;
  }

  private async getFileContentsForPrompt(
    message: string,
    context: string | undefined,
    containerId: string | undefined,
    attachedFiles?: { path: string; name: string }[],
    isFileQuestion?: boolean
  ): Promise<{ path: string; name: string; content: string }[] | undefined> {
    // If no containerId, cannot read any files
    if (!containerId) {
      return undefined;
    }

    // Handle explicitly attached files
    if (attachedFiles && attachedFiles.length > 0) {
      const fileContents: { path: string; name: string; content: string }[] = [];
      for (const file of attachedFiles) {
        try {
          const result = await this.containerService.readFile(containerId, `/workspace/${file.path}`);
          if (result.content) {
            fileContents.push({ path: file.path, name: file.name, content: result.content });
          }
        } catch (e) {
          console.log('Error reading attached file', file.path, e);
        }
      }
      if (fileContents.length > 0) {
        return fileContents;
      }
    }

    // Auto-fetch files for file-related questions
    if (isFileQuestion && containerId) {
      try {
        const listResult = await this.containerService.listFiles(containerId, '/workspace');
        const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.vue', '.py', '.java', '.go', '.rs', '.json', '.html', '.css', '.md', '.txt'];
        const sourceFiles = listResult.files
          .filter((f: string) =>
            sourceExtensions.some(ext => f.endsWith(ext)) &&
            !f.includes('node_modules/') &&
            !f.includes('.git/') &&
            !f.includes('dist/') &&
            !f.includes('build/')
          )
          .slice(0, 2);

        const fileContents: { path: string; name: string; content: string }[] = [];
        for (const filePath of sourceFiles) {
          try {
            const result = await this.containerService.readFile(containerId, `/workspace/${filePath}`);
            if (result.content) {
              fileContents.push({ path: filePath, name: filePath.split('/').pop() || filePath, content: result.content });
            }
          } catch (e) {
            console.log('Error reading file', filePath, e);
          }
        }
        if (fileContents.length > 0) {
          return fileContents;
        }
      } catch (e) {
        console.log('Error listing container files:', e);
      }
    }

    return undefined;
  }

  private buildPrompt(message: string, context: string, level: number, fileContents?: { path: string; name: string; content: string }[]): string {
    const progress = this.extractProgressFromContext(context);
    const isHandHoldy = level <= 2;

    const handHoldingInstructions = isHandHoldy
      ? `\nYOUR TEACHING STYLE - BE HAND-HOLDY (Level ${level}):\n- Give step-by-step instructions on exactly what to do\n- Break down tasks into small, actionable steps\n- Explain each step clearly like teaching a beginner\n- Provide specific file names, function names, or code patterns to look for\n- If they're stuck, guide them through the exact process\n`
      : `\nYOUR TEACHING STYLE - LESS HAND-HOLDY (Level ${level}):\n- Provide hints and guidance without giving away the answer\n- Offer guidance and direction without asking questions\n- Point them in the right direction without being too explicit\n- Encourage them to figure things out on their own\n- Only give big-picture guidance, not step-by-step instructions\n`;

    const rules = `\n═════════════════════════════════════════════════════════════\nABSOLUTE STRICT RULES - VIOLATION WILL NOT BE TOLERATED:\n═════════════════════════════════════════════════════════════\n
1. NEVER WRITE CODE - This is the most important rule\n   - Do NOT write any code in your response\n   - Do NOT include code blocks (\`\`\` or <code>)\n   - Do NOT provide code snippets or examples\n   - Do NOT show function definitions, variable declarations, or any syntax\n   - Even if the user asks "what is this file", describe it in WORDS only\n
2. When asked about files, describe in plain English ONLY:\n   - Instead of: "The file has a function called handleClick() that..."\n   - Say: "This file has a function that handles click events. It takes user input and processes it."\n   - Never show: function handleClick() { ... } or any code syntax\n
3. Answer EXACTLY what the user asks:\n   - If they ask what a file contains, describe it in words\n   - If they ask what a function does, explain it in plain English\n   - If they ask how something works, explain conceptually\n   - Do NOT assume they want code - they probably just want to understand\n
4. If they ask for a hint on a task:\n   - Be SPECIFIC about what to do - name specific files, functions, or areas\n   - Give concrete next steps they can take\n   - If you know which file needs changes, tell them exactly which file\n   - Don't just say "look at the files" - tell them WHICH file to look at\n   - Help them understand the task requirements clearly\n
${handHoldingInstructions}
═════════════════════════════════════════════════════════════\nABSOLUTE STRICT RULES - VIOLATION WILL NOT BE TOLERATED:\n═════════════════════════════════════════════════════════════`;

    const tasksText = progress.tasks.slice(0, 5).join('\n');
    
    let prompt = `You are SAZ, a friendly and helpful coding assistant for StudentHub, a learning platform where students complete coding projects.

CURRENT USER PROGRESS:
- Tasks completed: ${progress.completed} out of ${progress.total}
- Current Level: ${level}

RECENT TASKS:
${tasksText}

${context}

${rules}

USER'S QUESTION: "${message}"`;

    if (fileContents && fileContents.length > 0) {
      const filesText = fileContents.map(f => `=== ${f.name} ===\n${f.content}`).join('\n\n');
      prompt += `\n\nATTACHED FILES (explicitly attached by user for additional context):\n${filesText}`;
    }

    prompt += `\n\nYOUR TASK:\nWhen the user asks about files (like "what is in this file", "describe this file", "what does this file do", etc.), you MUST read and analyze the actual content of each file provided and describe:
- What the file contains (its actual code/functions/structure)
- What specific functionality it provides
- How the code works (in plain English, no code snippets)
- Any important details specific to THIS file's content

DO NOT give generic descriptions like "This file is part of a Next.js project" - instead, describe the ACTUAL content. For example:
- WRONG: "This file is the main entry point of the application"
- CORRECT: "The file App.tsx is the main React component. It imports Button and Layout components. The component renders a navigation bar with links to Dashboard, Books, Members, and BorrowRecords pages. It also displays a welcome message and uses React Router for navigation."

For each file, be specific about what the actual code does. If a file contains a function called handleSubmit, describe what handleSubmit does. If it imports certain modules, mention them.

Example of CORRECT answer (based on actual file content):
"The file App.tsx is the main React component. It imports Button and Layout components. The component renders a navigation bar with links to Dashboard, Books, Members, and BorrowRecords pages. It also displays a welcome message and uses React Router for navigation."`;

    return prompt;
  }

  private async getAIResponse(prompt: string, model?: string): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
      throw new Error('OPENROUTER_API_KEY is not configured. Please add it to your .env file. Get one free at https://openrouter.ai');
    }

    const defaultModels = [
      'nvidia/nemotron-3-nano-30b-a3b:free',
      'google/gemma-3n-e2b-it:free',
      'qwen/qwen3.6-plus:free',
      'nvidia/nemotron-3-super-120b-a12b:free',
      'google/gemini-2.5-flash:direct'
    ];

    const models = model ? [model, ...defaultModels.filter((m) => m !== model)] : defaultModels;

    let response = null;
    let lastError = null;

    for (const modelName of models) {
      console.log(`Trying model: ${modelName}`);

      if (modelName === 'google/gemini-2.5-flash:direct') {
        const geminiResult = await this.tryGeminiModel(prompt);
        if (geminiResult.success && geminiResult.hint) {
          return geminiResult.hint;
        }
        lastError = geminiResult.error;
        continue;
      }

      const openRouterResult = await this.tryOpenRouterModel(prompt, modelName, apiKey);
      if (openRouterResult.success && openRouterResult.hint) {
        return openRouterResult.hint;
      }
      lastError = openRouterResult.error;

      if (openRouterResult.status === 429 || openRouterResult.status === 404) {
        continue;
      } else {
        break;
      }
    }

    throw new Error(`Failed to get response from AI: ${lastError?.error?.message || lastError?.message || 'All models unavailable'}`);
  }

  private async tryGeminiModel(prompt: string): Promise<{ success: boolean; hint?: string; error?: any }> {
    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!geminiApiKey) {
      return { success: false, error: 'Google Gemini API key not configured' };
    }

    try {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
          })
        }
      );

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        const hint = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!hint) {
          return { success: false, error: 'No hint generated' };
        }
        return { success: true, hint };
      } else {
        const errorData = await geminiResponse.json();
        return { success: false, error: errorData };
      }
    } catch (error) {
      return { success: false, error };
    }
  }

  private async tryOpenRouterModel(
    prompt: string,
    model: string,
    apiKey: string
  ): Promise<{ success: boolean; hint?: string; error?: any; status?: number }> {
    try {
      const modelResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://devsim.com',
          'X-Title': 'DevSim AI Hints'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
          temperature: 0.7,
          reasoning: { enabled: false }
        })
      });

      if (modelResponse.ok) {
        const data = await modelResponse.json();
        const hint = data.choices?.[0]?.message?.content;
        if (!hint) {
          return { success: false, error: 'No hint generated' };
        }
        return { success: true, hint };
      } else {
        const errorData = await modelResponse.json();
        return { success: false, error: errorData, status: modelResponse.status };
      }
    } catch (error) {
      return { success: false, error };
    }
  }

  private async getUserCoinBalance(userId: string): Promise<number> {
    const result = await this.userDataAccess.getUserCoins(userId);
    return result.success ? (result.coins ?? 0) : 0;
  }
}
