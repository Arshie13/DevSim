// AI Help Helper Functions
import type { ITask } from "$lib/types";
import type { ChatMessage } from "$lib/stores/ai";
import { 
  MAX_ATTACHED_FILES,
  MAX_CHARS_PER_CHUNK,
  MAX_FILE_TREE_SHOW,
  MAX_MESSAGE_LENGTH,
  SOURCE_EXTENSIONS,
  HISTORY_PREVIEW_LENGTH,
  MAX_HISTORY_ITEMS
} from "./aiHelpConstants";

// Type for bubble/chat history items
export interface BubbleHistoryItem {
  id: string;
  preview: string;
  fullMessage: string;
  isChatMode: boolean;
  timestamp: number;
}

/**
 * Generate a unique ID for history items
 */
export function generateHistoryId(): string {
  return `hint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a bubble history item from a message
 */
export function createBubbleHistoryItem(
  message: string,
  isChatMode: boolean = false
): BubbleHistoryItem {
  const preview = message.length > HISTORY_PREVIEW_LENGTH 
    ? message.substring(0, HISTORY_PREVIEW_LENGTH) + "..."
    : message;
  
  return {
    id: generateHistoryId(),
    preview,
    fullMessage: message,
    isChatMode,
    timestamp: Date.now()
  };
}

/**
 * Get the preview text for a bubble history item
 */
export function getHistoryPreview(item: BubbleHistoryItem): string {
  return item.preview;
}

/**
 * Check if we can add more history items
 */
export function canAddHistoryItem(history: BubbleHistoryItem[]): boolean {
  return history.length < MAX_HISTORY_ITEMS;
}

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
 * Split a (long) AI message into readable parts WITHOUT breaking markdown.
 *
 * Fenced code blocks are kept whole, the rest is split on blank-line
 * (paragraph/step) boundaries, and consecutive blocks are grouped until they
 * reach ~targetLength. This lets the UI page through a long hint without ever
 * cutting a code block or a step in half.
 */
export function splitMessageIntoParts(content: string, targetLength = 600): string[] {
  if (!content || content.trim().length === 0) return [content];

  // 1. Break the message into atomic blocks (code fences stay intact).
  const blocks: string[] = [];
  const fenceRegex = /```[\s\S]*?```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = fenceRegex.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index);
    for (const para of before.split(/\n{2,}/)) {
      if (para.trim()) blocks.push(para.trim());
    }
    blocks.push(match[0]); // the fenced code block, untouched
    lastIndex = match.index + match[0].length;
  }
  for (const para of content.slice(lastIndex).split(/\n{2,}/)) {
    if (para.trim()) blocks.push(para.trim());
  }

  // 2. Group blocks into parts, never splitting a block.
  const parts: string[] = [];
  let current = "";
  for (const block of blocks) {
    if (current && current.length + block.length + 2 > targetLength) {
      parts.push(current.trim());
      current = block;
    } else {
      current = current ? `${current}\n\n${block}` : block;
    }
  }
  if (current.trim()) parts.push(current.trim());

  return parts.length > 0 ? parts : [content.trim()];
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

/**
 * Attach a file to the message
 */
export function attachFileToList(
  attachedFiles: { path: string; name: string }[],
  filePath: string,
  maxFiles: number
): { path: string; name: string }[] {
  if (attachedFiles.length >= maxFiles) return attachedFiles;
  const fileName = filePath.split("/").pop() || filePath;
  return [...attachedFiles, { path: filePath, name: fileName }];
}

/**
 * Remove a file from the attached files list
 */
export function removeFileFromList(
  attachedFiles: { path: string; name: string }[],
  filePath: string
): { path: string; name: string }[] {
  return attachedFiles.filter((f) => f.path !== filePath);
}

/**
 * Clear all attached files
 */
export function clearAllAttachedFiles(): { path: string; name: string }[] {
  return [];
}

/**
 * Check if user is scrolling in chat container
 */
export function isUserScrolling(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  threshold: number = 50
): boolean {
  return scrollHeight - scrollTop - clientHeight >= threshold;
}

/**
 * Navigate to next/previous hint chunk
 */
export function navigateHintChunk(
  direction: 'prev' | 'next',
  currentChunk: number,
  hintChunks: string[]
): number {
  if (direction === 'prev') {
    return Math.max(0, currentChunk - 1);
  } else {
    return Math.min(hintChunks.length - 1, currentChunk + 1);
  }
}

/**
 * Bubble state interface for managing bubble UI state
 */
export interface BubbleState {
  showQuickHint: boolean;
  bubbleChatMessage: string;
  useBubbleMode: boolean;
  isBubbleHidden: boolean;
  hintChunks: string[];
  currentHintChunk: number;
}

/**
 * Show bubble from history item
 */
export function showBubbleFromHistory(item: BubbleHistoryItem): Partial<BubbleState> {
  return {
    bubbleChatMessage: item.fullMessage,
    useBubbleMode: item.isChatMode,
    showQuickHint: true,
    isBubbleHidden: false,
    hintChunks: chunkHintMessage(item.fullMessage),
    currentHintChunk: 0
  };
}

/**
 * Reset bubble state
 */
export function resetBubbleState(): Partial<BubbleState> {
  return {
    bubbleChatMessage: "",
    useBubbleMode: false,
    showQuickHint: false,
    isBubbleHidden: false,
    hintChunks: [],
    currentHintChunk: 0
  };
}

/**
 * Check if bubble should auto-close based on conditions
 */
export function shouldAutoClose(
  allTasksCompleted: boolean,
  hintsShown: string[],
  maxHints: number = 5
): boolean {
  return allTasksCompleted || hintsShown.length >= maxHints;
}

/**
 * Add message to hints shown list
 */
export function addToHintsShown(
  hintsShown: string[],
  message: string,
  maxLength: number = 50
): string[] {
  const prefix = message.substring(0, maxLength);
  if (message && !hintsShown.includes(prefix)) {
    return [...hintsShown, prefix];
  }
  return hintsShown;
}

/**
 * Create AI message for chat history
 */
export function createAiMessage(
  content: string,
  isWarning: boolean = false
): { role: 'ai'; content: string; isWarning?: boolean } {
  return { role: 'ai', content, isWarning };
}

/**
 * Create user message for chat history
 */
export function createUserMessage(
  content: string,
  attachedFiles?: { path: string; name: string }[]
): { role: 'user'; content: string; attachedFiles?: { path: string; name: string }[] } {
  return { role: 'user', content, attachedFiles };
}
