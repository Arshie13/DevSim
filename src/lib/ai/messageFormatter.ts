// Message formatter utility for formatting AI messages

import { extractProgressFromContext, type ProgressInfo } from './contextBuilder';

/**
 * Format message content - convert URLs to links and newlines to <br> tags
 * @param content - The raw message content
 * @returns Formatted HTML string
 */
export function formatMessage(content: string): string {
  // First escape HTML to prevent XSS
  let formatted = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Parse markdown-style headings before newline conversion.
  formatted = formatted
    .replace(/^###\s+(.+)$/gm, '<span style="display:block;font-size:1.02em;font-weight:700;color:#f8fafc;margin:0.12em 0 0.32em;">$1</span>')
    .replace(/^##\s+(.+)$/gm, '<span style="display:block;font-size:1.08em;font-weight:700;color:#f8fafc;margin:0.12em 0 0.34em;">$1</span>')
    .replace(/^#\s+(.+)$/gm, '<span style="display:block;font-size:1.14em;font-weight:700;color:#f8fafc;margin:0.12em 0 0.36em;">$1</span>');

  // Convert newlines to <br> tags
  formatted = formatted.replace(/\n/g, '<br>');

  // Convert URLs to clickable links
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  formatted = formatted.replace(
    urlRegex,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline">$1</a>'
  );

  return formatted;
}

/**
 * Get CSS classes for message bubble based on role and type
 */
export function getMessageClasses(msg: { role: "user" | "ai"; isWarning?: boolean }): string {
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
 * Get CSS classes for message icon based on role and type
 */
export function getIconClasses(msg: { role: "user" | "ai"; isWarning?: boolean }): string {
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
 * Get insufficient coins warning message
 */
export function getInsufficientCoinsMessage(requiredCoins: number, currentCoins: number): string {
  return `⚠️ Not enough coins! You need ${requiredCoins} coins per hint. You have ${currentCoins} coins. Complete tasks or level up to earn more coins!`;
}

/**
 * Get default error message
 */
export function getErrorMessage(): string {
  return "Sorry, something went wrong. Please try again.";
}

/**
 * Get API error message
 */
export function getApiErrorMessage(error?: string): string {
  return error || "Sorry, I couldn't process your request. Please try again.";
}

/**
 * Build a friendly greeting response
 */
export function buildGreetingResponse(context: string): string {
  const progress = extractProgressFromContext(context);

  let response = "👋 Hello! I'm SAZ, your AI coding assistant for StudentHub! ";

  if (progress.total > 0) {
    response += `I can see you're working on a project with ${progress.total} tasks, and you've completed ${progress.completed} of them. `;

    if (progress.completed === 0) {
      response += "That's great - you're just getting started! ";
    } else if (progress.completed < progress.total) {
      response += "Keep up the good progress! ";
    } else {
      response += "Amazing! You've completed all tasks! ";
    }
  }

  response += "\n\nHere's how I can help:\n";
  response += "• 📝 Ask me for hints when you're stuck\n";
  response += "• 💡 Get guidance on your current task\n";
  response += "• 🔍 Help you understand code or concepts\n";
  response += "• 🎯 Point you in the right direction\n\n";
  response += "Feel free to ask me anything!";

  return response;
}

/**
 * Build a hint response based on user's progress
 */
export function buildProgressHintResponse(context: string): string {
  const progress: ProgressInfo = extractProgressFromContext(context);

  if (progress.total === 0 && progress.tasks.length === 0) {
    return "I don't see any tasks in your context yet. Try opening a project or loading a scenario first!";
  }

  const nextTask = progress.tasks.find(task => task.startsWith('[ ]'));

  let response = "📋 Here's your current progress: ";
  response += `${progress.completed}/${progress.total} tasks completed.\n\n`;

  if (nextTask) {
    response += "🎯 **Next Task:**\n";
    response += nextTask.replace('[ ]', '').trim() + "\n\n";
    response += "💡 **Hint:** Look at the task description and check the files in your project. ";

    const taskText = nextTask.toLowerCase();
    if (taskText.includes('install') || taskText.includes('npm') || taskText.includes('package')) {
      response += "You may need to run some installation commands in the terminal.";
    } else if (taskText.includes('create') || taskText.includes('add') || taskText.includes('file')) {
      response += "Try creating or modifying files in the explorer.";
    } else if (taskText.includes('run') || taskText.includes('start') || taskText.includes('test')) {
      response += "Check if there's a terminal or command to run.";
    } else if (taskText.includes('error') || taskText.includes('fix') || taskText.includes('debug')) {
      response += "Look at the error messages for clues on what to fix.";
    } else {
      response += "Break down the task into smaller steps and tackle them one at a time.";
    }
  } else {
    response += "🎉 Congratulations! You've completed all tasks! ";
    if (progress.completed === progress.total && progress.total > 0) {
      response += "Great job! You can submit your work or move on to the next level.";
    }
  }

  return response;
}
