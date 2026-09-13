const TECHNICAL_BOOT_ERROR = /ENOENT|ECONNREFUSED|ECONNRESET|ETIMEDOUT|docker_engine|docker\.sock|socket hang up|connect E|preview ports|exposes 5173/i;

/**
 * Produces a friendly, non-technical message for the workspace boot screen.
 * Raw Docker/connection failures are collapsed into an actionable hint; any
 * already-friendly message (e.g. a missing workspace) is returned unchanged.
 */
export function toFriendlyBootError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : String(error);

  if (!message || TECHNICAL_BOOT_ERROR.test(message)) {
    return fallback;
  }

  return message;
}
