export const AI_NAME = 'SAZ';
export const AI_AVATAR = '/images/saz.png';

export const COSTS = {
  QUICK_HINT: 100,
  CHAT_HINT: 200,
  PER_ATTACHED_FILE: 15,
} as const;

export const LIMITS = {
  MAX_ATTACHED_FILES: 3,
  MAX_CONTEXT_FILES: 30,
  MAX_LINES_PER_FILE: 200,
  MAX_CHAT_HISTORY: 4,
} as const;

export const SOURCE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.svelte', '.vue',
  '.py', '.java', '.go', '.rs', '.json', '.html', '.css', '.scss'
] as const;