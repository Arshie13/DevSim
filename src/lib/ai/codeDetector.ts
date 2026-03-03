// Code detection utility - determines if user is asking for code/solutions

// Patterns that indicate user is asking for code
const CODE_PATTERNS = [
  // Direct code requests
  /\b(write|create|generate|build|make|implement)\s+(code|the|a|an|some|me)\b/i,
  /\b(give|show|provide)\s+(me\s+)?(the\s+)?(code|solution|answer)\b/i,
  /\b(code|solution|answer)\s+(please|now|for me)\b/i,
  /\bwrite\s+the\s+code\b/i,
  /\bhow\s+to\s+write\b/i,
  /\bhow\s+to\s+create\b/i,
  /\bhow\s+to\s+build\b/i,
  /\bshow\s+me\s+the\s+code\b/i,
  /\bshow\s+me\s+how\b/i,
  /\bcode\s+for\b/i,
  /\bcode\s+to\b/i,
  /\bsolution\s+code\b/i,
  /\bthe\s+code\b/i,
  /\bfull\s+code\b/i,
  /\bcomplete\s+code\b/i,
  /\bentire\s+code\b/i,
  /\ball\s+the\s+code\b/i,
  // Code blocks
  /```/,
  /<code>/,
  // Function/class definitions
  /function\s+\w+\s*\(/,
  /const\s+\w+\s*=/,
  /let\s+\w+\s*=/,
  /import\s+.*from/,
  /export\s+(default\s+)?(function|class|const)/,
  /class\s+\w+/,
  // Request for complete solution
  /\bfix\s+this\s+for\s+me\b/i,
  /\bsolve\s+this\s+for\s+me\b/i,
  /\bdo\s+this\s+for\s+me\b/i,
];

/**
 * Check if the user's message is asking for code or a complete solution
 * @param message - The user's message to check
 * @returns true if the message is asking for code/solution
 */
export function isAskingForCode(message: string): boolean {
  return CODE_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Get a warning message for when user asks for code
 * @returns The warning message
 */
export function getCodeWarningMessage(): string {
  return "⚠️ Out of Scope: I can only provide hints and guidance, not code solutions. I'm here to help you learn by figuring things out yourself. Try asking for a hint instead!";
}
