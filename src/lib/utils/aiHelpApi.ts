// AI Help API Helper Functions
import { get } from 'svelte/store';
import type { ITask } from "$lib/types";
import { aiChatHistory, aiCoins, aiSelectedFile, aiFileTree, aiFileContents } from "$lib/stores/ai";
import { isAskingForCode, getCodeWarningMessage, getInsufficientCoinsMessage, getErrorMessage, getApiErrorMessage } from "$lib/ai";
import type { ChatMessage } from "$lib/stores/ai";
import { 
  MAX_ATTACHED_FILES,
  MAX_CHARS_PER_CHUNK,
  MAX_FILE_LINES,
  MAX_FILES_TO_LIST,
  MAX_FILES_TO_READ,
  MAX_MESSAGE_LENGTH,
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
    });
  }
  
  context += `\n=== HINT INSTRUCTIONS ===\n`;
  if (tasks && tasks.length > 0) {
    context += `Based on the user's current task progress above, please provide a helpful hint that:\n`;
    context += `1. Focus on the next incomplete task (tasks marked with [ ])\n`;
    context += `2. Consider the current state of the project files\n`;
    context += `3. Be specific and actionable\n`;
    context += `4. If all tasks are completed (all show [√]), congratulate the user and offer to help\n`;
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
  totalCost: number,
  generateContextFn: () => Promise<string>
): Promise<{ success: boolean; error?: string }> {
  if (isAskingForCode(message)) {
    aiChatHistory.update((msgs) => [
      ...msgs,
      { role: "user", content: message },
      { role: "ai", content: getCodeWarningMessage(), isWarning: true },
    ]);
    return { success: false };
  }

  if (currentCoins < totalCost) {
    aiChatHistory.update(msgs => [
      ...msgs,
      { role: "user", content: message },
      { role: "ai", content: getInsufficientCoinsMessage(totalCost, currentCoins), isWarning: true },
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
      return { success: true };
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
 * Request a quick hint from the AI
 */
export async function requestQuickHint(
  message: string,
  containerId: string,
  userId: string,
  level: number,
  generateContextFn: () => Promise<string>
): Promise<{ success: boolean; hint?: string; error?: string; coinsRemaining?: number }> {
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
      return { success: true, hint: data.hint, coinsRemaining: data.coinsRemaining };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error("Error getting quick hint:", error);
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
