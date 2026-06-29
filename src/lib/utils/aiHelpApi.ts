// AI Help API Helper Functions
import { get } from 'svelte/store';
import type { ITask } from "$lib/types";
import { aiChatHistory, aiCoins, aiHelpCredits, aiSelectedFile, aiFileTree, aiFileContents } from "$lib/stores/ai";
import { isAskingForCode, getCodeWarningMessage, getInsufficientCreditsMessage, getErrorMessage, getApiErrorMessage } from "$lib/ai";
import type { ChatMessage } from "$lib/stores/ai";
import {
  MAX_ATTACHED_FILES,
  MAX_CHARS_PER_CHUNK,
  MAX_FILE_LINES,
  MAX_FILES_TO_LIST,
  MAX_FILES_TO_READ,
  MAX_MESSAGE_LENGTH,
  QUICK_HINT_CREDIT_COST,
  CHAT_HINT_CREDIT_COST,
  COINS_PER_AI_HELP_CREDIT,
  SOURCE_EXTENSIONS
} from "./aiHelpConstants";

/**
 * Generate context for AI request
 */
export async function generateContext(
  scenario: string,
  projectName: string,
  mode: "chat" | "quick",
  containerId: string,
  tasks: ITask[] | undefined,
  selectedFile: string,
  fileTree: string[],
  fileContents: Record<string, string>,
  attachedFiles: { path: string; name: string }[]
): Promise<string> {
  let context = `=== PROJECT OVERVIEW ===\n`;
  context += `Project: ${projectName || 'DevSim Workspace'}\n`;
  context += `Scenario: ${scenario}\n\n`;

  if (mode === "chat") {
    const chatHistory = get(aiChatHistory);
    if (chatHistory.length > 0) {
      context += `=== RECENT CONVERSATION ===\n`;
      const recentHistory = chatHistory.slice(-4);
      recentHistory.forEach((msg: ChatMessage) => {
        const role = msg.role === "user" ? "User" : "AI";
        const content = msg.content.length > MAX_MESSAGE_LENGTH
          ? msg.content.substring(0, MAX_MESSAGE_LENGTH) + "..."
          : msg.content;
        context += `${role}: ${content}\n`;
      });
      context += "\n";
    }
  }

  if (fileTree.length > 0) {
    context += `Project Files (${fileTree.length} files):\n`;
    const filesToShow = fileTree.slice(0, MAX_FILES_TO_LIST);
    filesToShow.forEach((file) => {
      context += `- ${file}\n`;
    });
    if (fileTree.length > MAX_FILES_TO_LIST) {
      context += `- ... and ${fileTree.length - MAX_FILES_TO_LIST} more files\n`;
    }
    context += "\n";
  }

  const importantFiles = fileTree.filter((f) =>
    SOURCE_EXTENSIONS.some((ext) => f.endsWith(ext)),
  );

  const filesToRead: string[] = [];

  if (selectedFile) {
    filesToRead.push(selectedFile);
  }

  for (const file of importantFiles) {
    if (filesToRead.length >= MAX_FILES_TO_READ) break;
    if (!fileContents[file] && file !== selectedFile) {
      filesToRead.push(file);
    }
  }

  if (filesToRead.length > 0 && containerId) {
    try {
      const fetchPromises = filesToRead.map(async (file) => {
        try {
          const res = await fetch(
            `/api/docker/container/${containerId}/files/read`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: `/workspace/${file}` }),
            },
          );
          const data = await res.json();
          if (data.success) {
            return { file, content: data.content };
          }
        } catch (e) {
          console.error(`Error reading file ${file}:`, e);
        }
        return null;
      });

      const results = await Promise.all(fetchPromises);
      for (const result of results) {
        if (result) {
          fileContents[result.file] = result.content;
        }
      }
    } catch (e) {
      console.error("[AI Helper] Error fetching file contents:", e);
    }
  }

  const filesWithContent = filesToRead.filter((f) => fileContents[f]);

  for (const file of filesWithContent) {
    if (!file) continue;
    const content = fileContents[file];
    if (content) {
      context += `=== File: ${file} ===\n`;
      const lines = content.split('\n');
      const linesToShow = lines.slice(0, MAX_FILE_LINES);

      linesToShow.forEach((line, index) => {
        const lineNum = index + 1;
        context += `${lineNum}: ${line}\n`;
      });

      if (lines.length > MAX_FILE_LINES) {
        context += `... (showing first ${MAX_FILE_LINES} of ${lines.length} lines)\n`;
      }
      context += "\n";
    }
  }

  if (attachedFiles.length > 0) {
    context += `=== ATTACHED FILES (${attachedFiles.length}/${MAX_ATTACHED_FILES}) ===\n`;

    const attachedFetchPromises = attachedFiles.map(async (file) => {
      try {
        const filePath = file.path.startsWith('/workspace/') ? file.path : `/workspace/${file.path}`;
        const res = await fetch(`/api/docker/container/${containerId}/files/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: filePath }),
        });
        const data = await res.json();
        if (data.success) {
          return { file, content: data.content };
        } else {
          return { file, content: `// Error: Could not read file ${file.name}` };
        }
      } catch (e) {
        return { file, content: `// Error: ${e}` };
      }
    });

    const attachedResults = await Promise.all(attachedFetchPromises);

    for (const result of attachedResults) {
      if (result) {
        const { file, content } = result;
        context += `--- File: ${file.name} ---\n`;
        context += `// Path: ${file.path}\n`;
        const lines = content.split('\n');
        const linesToShow = lines.slice(0, MAX_FILE_LINES);

        linesToShow.forEach((line: string, index: number) => {
          const lineNum = index + 1;
          context += `${lineNum}: ${line}\n`;
        });

        if (lines.length > MAX_FILE_LINES) {
          context += `... (showing first ${MAX_FILE_LINES} of ${lines.length} lines)\n`;
        }
        context += "\n";
      }
    }
  }

  const completedCount = tasks ? tasks.filter(t => t.isCompleted).length : 0;
  context += `Tasks (${completedCount}/${tasks ? tasks.length : 0} completed):\n`;

  if (!tasks || tasks.length === 0) {
    if (scenario) {
      context += `Current scenario: ${scenario}\n`;
    }
    context += `No tasks loaded. Please provide general guidance based on the project files.\n`;
  } else {
    tasks.forEach((task) => {
      const status = task.isCompleted ? "[√]" : "[ ]";
      context += `${status} ${task.taskName}\n`;

      // Include acceptance criteria for each task
      if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
        context += `   Acceptance Criteria:\n`;
        task.acceptanceCriteria.forEach((ac) => {
          const req = ac.isRequired ? "[REQUIRED]" : "[OPTIONAL]";
          context += `   - ${req} ${ac.description}\n`;
        });
      }

      // Include hints for incomplete tasks
      if (!task.isCompleted && task.hints && task.hints.length > 0) {
        context += `   Hints Available:\n`;
        task.hints.forEach((hint, idx) => {
          context += `   ${idx + 1}. ${hint.content}\n`;
        });
      }
    });
  }

  context += `\n=== HINT INSTRUCTIONS ===\n`;
  if (tasks && tasks.length > 0) {
    context += `Based on the user's current task progress above, please provide a helpful hint that:\n`;
    context += `1. Focus on the next incomplete task (tasks marked with [ ])\n`;
    context += `2. Consider the acceptance criteria for the current task\n`;
    context += `3. Use the provided hints if the user seems stuck\n`;
    context += `4. Consider the current state of the project files\n`;
    context += `5. Be specific and actionable\n`;
    context += `6. If all tasks are completed (all show [√]), congratulate the user and offer to help\n`;
  } else {
    context += `Provide helpful guidance based on the scenario and project files provided above.\n`;
  }

  return context;
}

/**
 * Send a chat message and get AI response
 */
export async function sendChatMessage(
  message: string,
  containerId: string,
  userId: string,
  level: number,
  mode: "chat" | "quick",
  attachedFiles: { path: string; name: string }[],
  currentCoins: number,
  currentCredits: number,
  generateContextFn: () => Promise<string>,
  model?: string
): Promise<{ success: boolean; error?: string; coinsRemaining?: number; aiHelpsRemaining?: number }> {
  if (isAskingForCode(message)) {
    aiChatHistory.update((msgs) => [
      ...msgs,
      { role: "user", content: message },
      { role: "ai", content: getCodeWarningMessage(), isWarning: true },
    ]);
    return { success: false };
  }

  // Credits are the currency; any shortfall is covered by converting coins.
  const creditCost = mode === 'quick' ? QUICK_HINT_CREDIT_COST : CHAT_HINT_CREDIT_COST;
  const creditsShort = Math.max(0, creditCost - currentCredits);
  if (creditsShort * COINS_PER_AI_HELP_CREDIT > currentCoins) {
    aiChatHistory.update(msgs => [
      ...msgs,
      { role: "user", content: message },
      { role: "ai", content: getInsufficientCreditsMessage(creditCost, currentCredits, currentCoins, COINS_PER_AI_HELP_CREDIT), isWarning: true },
    ]);
    return { success: false };
  }

  const filesToInclude = [...attachedFiles];
  const filesCount = filesToInclude.length;
  aiChatHistory.update(msgs => [...msgs, { role: "user", content: message, attachedFiles: filesCount > 0 ? filesToInclude : undefined }]);

  try {
    const context = await generateContextFn();

    const response = await fetch("/api/ai/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        context,
        containerId,
        userId,
        hintType: mode,
        model,
        attachedFilesCount: filesCount,
        attachedFiles: filesToInclude,
        level,
      }),
    });

    const data = await response.json();

    if (data.success) {
      aiChatHistory.update((msgs) => [...msgs, { role: "ai", content: data.hint }]);
      if (data.coinsRemaining !== undefined) {
        aiCoins.set(data.coinsRemaining);
      }
      if (data.aiHelpsRemaining !== undefined) {
        aiHelpCredits.set(data.aiHelpsRemaining);
      }
      return { success: true, coinsRemaining: data.coinsRemaining, aiHelpsRemaining: data.aiHelpsRemaining };
    } else {
      aiChatHistory.update((msgs) => [...msgs, { role: "ai", content: getApiErrorMessage(data.error) }]);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error("Error getting AI hint:", error);
    aiChatHistory.update((msgs) => [...msgs, { role: "ai", content: getErrorMessage() }]);
    return { success: false, error: String(error) };
  }
}

/**
 * Request a quick hint from the AI (for ThoughtBubble display)
 */
export async function requestQuickHintBubble(
  message: string,
  containerId: string,
  userId: string,
  level: number,
  generateContextFn: () => Promise<string>,
  onSuccess?: (hint: string, coinsRemaining?: number, aiHelpsRemaining?: number) => void,
  onError?: (error: string) => void,
  model?: string
): Promise<{ success: boolean; hint?: string; error?: string; coinsRemaining?: number; aiHelpsRemaining?: number }> {
  try {
    const response = await fetch("/api/ai/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        context: await generateContextFn(),
        containerId,
        userId,
        hintType: "quick",
        model,
        attachedFilesCount: 0,
        attachedFiles: [],
        level,
      }),
    });

    const data = await response.json();

    if (data.success) {
      if (data.coinsRemaining !== undefined) {
        aiCoins.set(data.coinsRemaining);
      }
      if (data.aiHelpsRemaining !== undefined) {
        aiHelpCredits.set(data.aiHelpsRemaining);
      }
      if (onSuccess) {
        onSuccess(data.hint, data.coinsRemaining, data.aiHelpsRemaining);
      }
      return { success: true, hint: data.hint, coinsRemaining: data.coinsRemaining, aiHelpsRemaining: data.aiHelpsRemaining };
    } else {
      const errorMsg = getApiErrorMessage(data.error);
      if (onError) {
        onError(errorMsg);
      }
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error("Error getting quick hint:", error);
    const errorMsg = getErrorMessage();
    if (onError) {
      onError(errorMsg);
    }
    return { success: false, error: String(error) };
  }
}

/**
 * Send chat message and get AI response (for ThoughtBubble display)
 */
export async function sendBubbleChatMessage(
  message: string,
  containerId: string,
  userId: string,
  level: number,
  mode: "chat" | "quick",
  attachedFiles: { path: string; name: string }[],
  currentCoins: number,
  currentCredits: number,
  generateContextFn: () => Promise<string>,
  onSuccess?: (hint: string, coinsRemaining?: number) => void,
  onError?: (error: string) => void,
  model?: string
): Promise<{ success: boolean; error?: string; coinsRemaining?: number; aiHelpsRemaining?: number }> {
  if (isAskingForCode(message)) {
    const warningMsg = getCodeWarningMessage();
    aiChatHistory.update((msgs) => [
      ...msgs,
      { role: "user", content: message },
      { role: "ai", content: warningMsg, isWarning: true },
    ]);
    if (onError) {
      onError(warningMsg);
    }
    return { success: false };
  }

  const creditCost = mode === 'quick' ? QUICK_HINT_CREDIT_COST : CHAT_HINT_CREDIT_COST;
  const creditsShort = Math.max(0, creditCost - currentCredits);
  if (creditsShort * COINS_PER_AI_HELP_CREDIT > currentCoins) {
    const errorMsg = getInsufficientCreditsMessage(creditCost, currentCredits, currentCoins, COINS_PER_AI_HELP_CREDIT);
    aiChatHistory.update(msgs => [
      ...msgs,
      { role: "user", content: message },
      { role: "ai", content: errorMsg, isWarning: true },
    ]);
    if (onError) {
      onError(errorMsg);
    }
    return { success: false };
  }

  const filesToInclude = [...attachedFiles];
  const filesCount = filesToInclude.length;
  aiChatHistory.update(msgs => [...msgs, { role: "user", content: message, attachedFiles: filesCount > 0 ? filesToInclude : undefined }]);

  try {
    const context = await generateContextFn();

    const response = await fetch("/api/ai/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        context,
        containerId,
        userId,
        hintType: mode,
        model,
        attachedFilesCount: filesCount,
        attachedFiles: filesToInclude,
        level,
      }),
    });

    const data = await response.json();

    if (data.success) {
      aiChatHistory.update((msgs) => [...msgs, { role: "ai", content: data.hint }]);
      if (data.coinsRemaining !== undefined) {
        aiCoins.set(data.coinsRemaining);
      }
      if (data.aiHelpsRemaining !== undefined) {
        aiHelpCredits.set(data.aiHelpsRemaining);
      }
      if (onSuccess) {
        onSuccess(data.hint, data.coinsRemaining);
      }
      return { success: true, coinsRemaining: data.coinsRemaining, aiHelpsRemaining: data.aiHelpsRemaining };
    } else {
      const errorMsg = getApiErrorMessage(data.error);
      aiChatHistory.update((msgs) => [...msgs, { role: "ai", content: errorMsg }]);
      if (onError) {
        onError(errorMsg);
      }
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error("Error getting AI hint:", error);
    const errorMsg = getErrorMessage();
    aiChatHistory.update((msgs) => [...msgs, { role: "ai", content: errorMsg }]);
    if (onError) {
      onError(errorMsg);
    }
    return { success: false, error: String(error) };
  }
}

/**
 * Read file content from container
 */
export async function readFileContent(containerId: string, filePath: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/docker/container/${containerId}/files/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: filePath }),
    });
    const data = await res.json();
    if (data.success) {
      return data.content;
    }
    return null;
  } catch (e) {
    console.error(`Error reading file ${filePath}:`, e);
    return null;
  }
}

/**
 * Process AI response and add to chat history
 */
export function processAiResponse(
  data: { success: boolean; hint?: string; error?: string; coinsRemaining?: number },
  errorMessage: string,
  updateCoins?: (coins: number) => void
): { success: boolean; hint: string } {
  if (data.success && data.hint) {
    if (data.coinsRemaining !== undefined && updateCoins) {
      updateCoins(data.coinsRemaining);
    }
    return { success: true, hint: data.hint };
  } else {
    return { success: false, hint: data.error || errorMessage };
  }
}

/**
 * Build hint message based on tasks state
 */
export function buildHintMessage(tasks: ITask[] | undefined, hintCost: number): string {
  if (!tasks || tasks.length === 0) {
    return "Give me a SHORT hint for my current sprint task. Which file should I work on and what specifically needs to be done?";
  }

  const currentTask = tasks.find(t => !t.isCompleted);
  if (currentTask) {
    const completedCount = tasks.filter(t => t.isCompleted).length;
    let message = `Current task: "${currentTask.taskName}" (${completedCount}/${tasks.length} done). `;
    
    // Include acceptance criteria in the message
    if (currentTask.acceptanceCriteria && currentTask.acceptanceCriteria.length > 0) {
      message += "\nAcceptance Criteria:\n";
      currentTask.acceptanceCriteria.forEach((ac) => {
        const req = ac.isRequired ? "[REQUIRED]" : "[OPTIONAL]";
        message += `- ${req}: ${ac.description}\n`;
      });
    }
    
    // Include hints in the message
    if (currentTask.hints && currentTask.hints.length > 0) {
      message += "\nHints available:\n";
      currentTask.hints.forEach((hint, idx) => {
        message += `${idx + 1}. ${hint.content}\n`;
      });
    }
    
    message += "\nGive me a SHORT, specific hint - which file and exactly what to do?";
    return message;
  }

  if (tasks.every(t => t.isCompleted)) {
    return "All tasks done! Quick congrats and ask if they need help with anything else.";
  }

  return "Give me a SHORT hint for my current sprint task. Which file should I work on and what specifically needs to be done?";
}

/**
 * Validate message before sending
 */
export function validateMessage(
  message: string,
  isLoading: boolean,
  currentCoins: number,
  totalCost: number
): { valid: boolean; error?: string } {
  if (!message.trim()) {
    return { valid: false, error: "Empty message" };
  }
  if (isLoading) {
    return { valid: false, error: "Already loading" };
  }
  if (currentCoins < totalCost) {
    return { valid: false, error: "Insufficient coins" };
  }
  return { valid: true };
}