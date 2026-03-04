// Message formatter utility for formatting AI messages

/**
 * Format message content - convert URLs to links and newlines to <br> tags
 * @param content - The raw message content
 * @returns Formatted HTML string
 */
export function formatMessage(content: string): string {
  // First escape HTML to prevent XSS
  let formatted = content
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>');

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
