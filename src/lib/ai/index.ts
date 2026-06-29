// AI Helper Module - Central export point

// Code detection
export { isAskingForCode, getCodeWarningMessage } from './codeDetector';

// Context building
export { buildContext, getSimpleContext, extractProgressFromContext, type ContextOptions, type Task, type ProgressInfo } from './contextBuilder';

// Message classification
export { isAskingAboutFileContents, isGreeting, isAskingAboutProgress } from './classifier';

// Message formatting
export {
  formatMessage,
  formatLearningContent,
  getMessageClasses,
  getIconClasses,
  getInsufficientCoinsMessage,
  getInsufficientCreditsMessage,
  getErrorMessage,
  getApiErrorMessage,
  buildGreetingResponse,
  buildProgressHintResponse
} from './messageFormatter';

// Prompt building
export { buildPrompt } from './promptBuilder';