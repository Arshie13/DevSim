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
  level?: number;
  attachedFilesCount?: number;
  attachedFiles?: { path: string; name: string }[];
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
    const { message, context, containerId, userId: uid, hintType, attachedFilesCount = 0, attachedFiles, level = 1 } = body;
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
          ).slice(0, 20);

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

    const models = [
      // "meta-llama/llama-3.1-8b-instruct",
      // "google/gemma-2-9b-it",
      // "mistralai/mistral-7b-instruct-v0.2",
      "qwen/qwen3.6-plus:free",
      "nvidia/nemotron-3-super-120b-a12b:free"
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
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
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
