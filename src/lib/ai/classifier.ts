// Message classifier - determines the type of user message

// Patterns for asking about file contents
const FILE_CONTENT_PATTERNS = [
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

// Patterns for greetings
const GREETING_PATTERNS = [
  /^\s*(hi|hello|hey|howdy|hiya|yo|sup|what's up|what up|greetings)\s*$/i,
  /^\s*(hi|hello|hey|howdy|hiya|yo|sup|what's up|what up|greetings)\s*!.*$/i,
  /^\s*(good morning|good afternoon|good evening)\s*$/i,
  /^\s*thanks for joining/i,
  /^\s*i('m| am)\s+new/i,
  /^\s*(start|begin|ready|lets|let us)\s+(go|start|begin)/i,
];

// Patterns for progress/status questions
const PROGRESS_PATTERNS = [
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

/**
 * Check if the user is asking about file contents
 */
export function isAskingAboutFileContents(message: string): boolean {
  return FILE_CONTENT_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Check if the user is greeting
 */
export function isGreeting(message: string): boolean {
  return GREETING_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Check if the user is asking about their progress
 */
export function isAskingAboutProgress(message: string): boolean {
  return PROGRESS_PATTERNS.some((pattern) => pattern.test(message));
}