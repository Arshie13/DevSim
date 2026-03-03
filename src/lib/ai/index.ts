// AI Helper Module - Central export point

// Code detection
export { isAskingForCode, getCodeWarningMessage } from './codeDetector';

// Context building
export { buildContext, getSimpleContext, type ContextOptions, type Task } from './contextBuilder';

// Message formatting
export { 
  formatMessage, 
  getMessageClasses, 
  getIconClasses,
  getInsufficientCoinsMessage,
  getErrorMessage,
  getApiErrorMessage
} from './messageFormatter';
