// AI Help Constants

export const MAX_ATTACHED_FILES = 3;
// AI help credits are the only currency the AI helper accepts.
export const QUICK_HINT_CREDIT_COST = 1;
export const CHAT_HINT_CREDIT_COST = 2;
// When the user runs out of credits, coins are converted at this rate to cover the cost.
export const COINS_PER_AI_HELP_CREDIT = 100;
export const MAX_CHARS_PER_CHUNK = 250;
export const MAX_FILE_TREE_SHOW = 200;
export const MAX_FILES_TO_READ = 21;
export const MAX_FILE_LINES = 200;
export const MAX_FILES_TO_LIST = 30;
export const MAX_MESSAGE_LENGTH = 500;

// History tracking for bubble messages
export const HISTORY_PREVIEW_LENGTH = 40;
export const MAX_HISTORY_ITEMS = 10;

// Source file extensions for filtering
export const SOURCE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.svelte', '.vue', '.py', '.java', '.go', '.rs', '.json', '.html', '.css', '.scss'
];
