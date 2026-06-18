// AI Store - Manages AI chat and state across the application
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

// Chat message type
export type ChatMessage = { 
  role: "user" | "ai"; 
  content: string; 
  isWarning?: boolean;
  attachedFiles?: { path: string; name: string }[];
};

// Store for AI chat history - persists across tab switches
export const aiChatHistory: Writable<ChatMessage[]> = writable([]);

// Store for coin count - persists across tab switches
export const aiCoins: Writable<number> = writable(1000);

// Store for the user's remaining AI help credits (spent before coins)
export const aiHelpCredits: Writable<number> = writable(0);

// Store for selected file - persists across tab switches
export const aiSelectedFile: Writable<string> = writable("");

// Store for file tree - persists across tab switches
export const aiFileTree: Writable<string[]> = writable([]);

// Store for file contents - persists across tab switches
export const aiFileContents: Writable<Record<string, string>> = writable({});

// Store for current AI panel visibility
export const aiPanelOpen: Writable<boolean> = writable(false);

// Helper functions to manage chat history
export function addUserMessage(content: string) {
  aiChatHistory.update(msgs => [...msgs, { role: "user", content }]);
}

export function addAIMessage(content: string, isWarning: boolean = false) {
  aiChatHistory.update(msgs => [...msgs, { role: "ai", content, isWarning }]);
}

export function clearChatHistory() {
  aiChatHistory.set([]);
}

export function updateCoinBalance(newBalance: number) {
  aiCoins.set(newBalance);
}
