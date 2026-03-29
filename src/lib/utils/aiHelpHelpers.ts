// AI Help Helper Functions
import type { ITask } from "$lib/types";
import { 
  MAX_ATTACHED_FILES,
  MAX_CHARS_PER_CHUNK,
  MAX_FILE_TREE_SHOW,
  MAX_MESSAGE_LENGTH,
  SOURCE_EXTENSIONS
} from "./aiHelpConstants";

/**
 * Split hint message into chunks that fit in thought bubble - fixed per sentence
 */
export function chunkHintMessage(message: string): string[] {
  if (!message || message.trim().length === 0) {
    return ["No hint available"];
  }
  
  if (message.length <= MAX_CHARS_PER_CHUNK) {
    return [message.trim()];
  }
  
  const chunks: string[] = [];
  const sentences = message.split(/(?<=[.!?])\s+/);
  let currentChunk = "";
  
  for (const sentence of sentences) {
    if (sentence.length > MAX_CHARS_PER_CHUNK) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      const words = sentence.split(/\s+/);
      let wordChunk = "";
      for (const word of words) {
        if ((wordChunk + " " + word).trim().length <= MAX_CHARS_PER_CHUNK) {
          wordChunk = (wordChunk + " " + word).trim();
        } else {
          if (wordChunk) chunks.push(wordChunk);
          wordChunk = word;
        }
      }
      if (wordChunk) currentChunk = wordChunk;
    } else if ((currentChunk + " " + sentence).trim().length <= MAX_CHARS_PER_CHUNK) {
      currentChunk = (currentChunk + " " + sentence).trim();
    } else {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.length > 0 ? chunks : [message];
}

/**
 * Get CSS classes for message bubble
 */
export function getMessageClasses(msg: {
  role: "user" | "ai";
  isWarning?: boolean;
}): string {
  let classes = "max-w-[85%] p-3 rounded-lg text-sm ";
  if (msg.role === "user") {
    classes += "bg-cyan-600/20 text-gray-100";
  } else if (msg.isWarning) {
    classes += "bg-yellow-600/20 border border-yellow-600/50 text-yellow-200";
  } else {
    classes += "bg-slate-900/60 text-gray-300";
  }
  return classes;
}

/**
 * Get CSS classes for message icon
 */
export function getIconClasses(msg: {
  role: "user" | "ai";
  isWarning?: boolean;
}): string {
  let classes = "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ";
  if (msg.role === "user") {
    classes += "bg-cyan-500";
  } else if (msg.isWarning) {
    classes += "bg-yellow-600";
  } else {
    classes += "bg-slate-700";
  }
  return classes;
}

/**
 * Filter source files from file tree
 */
export function filterSourceFiles(fileTree: string[], attachedFiles: { path: string; name: string }[]): string[] {
  return fileTree.filter(f => 
    SOURCE_EXTENSIONS.some(ext => f.endsWith(ext)) &&
    !attachedFiles.some(af => af.path === f)
  ).slice(0, MAX_FILE_TREE_SHOW);
}

import { QUICK_HINT_COST, CHAT_HINT_COST, ATTACHED_FILE_COST } from "./aiHelpConstants";

/**
 * Calculate total cost for hint
 */
export function calculateTotalCost(mode: "chat" | "quick", attachedFilesLength: number): number {
  const hintCost = mode === 'quick' ? QUICK_HINT_COST : CHAT_HINT_COST;
  return hintCost + (attachedFilesLength * ATTACHED_FILE_COST);
}

/**
 * Check if all tasks are completed
 */
export function areAllTasksCompleted(tasks: ITask[] | undefined): boolean {
  return !!(tasks && tasks.length > 0 && tasks.every(t => t.isCompleted));
}

/**
 * Get current task or determine hint message based on task state
 */
export function getHintMessage(tasks: ITask[] | undefined): { currentTask: ITask | null; message: string } {
  if (!tasks || tasks.length === 0) {
    return { currentTask: null, message: "Give me a SHORT hint for my current sprint task. Which file should I work on and what specifically needs to be done?" };
  }
  
  const currentTask = tasks.find(t => !t.isCompleted);
  if (currentTask) {
    const completedCount = tasks.filter(t => t.isCompleted).length;
    return {
      currentTask,
      message: `Current task: "${currentTask.taskName}" (${completedCount}/${tasks.length} done). Give me a SHORT, specific hint - which file and exactly what to do?`
    };
  }
  
  if (tasks.every(t => t.isCompleted)) {
    return { currentTask: null, message: "All tasks done! Quick congrats and ask if they need help with anything else." };
  }
  
  return { currentTask: null, message: "Give me a SHORT hint for my current sprint task. Which file should I work on and what specifically needs to be done?" };
}

/**
 * Format chat message for display
 */
export function formatMessageContent(content: string, maxLength: number = MAX_MESSAGE_LENGTH): string {
  if (content.length > maxLength) {
    return content.substring(0, maxLength) + "...";
  }
  return content;
}

/**
 * Get file name from path
 */
export function getFileName(filePath: string): string {
  return filePath.split('/').pop() || filePath;
}
