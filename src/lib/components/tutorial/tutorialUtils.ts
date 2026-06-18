export function normalizeCommand(value: string): string {
  return value
    .replace(/\x1b\[[0-9;]*[A-Za-z]/g, "")
    .replace(/\x1b./g, "")
    .replace(/\[(?:200|201)~/g, "")
    .replace(/[\x00-\x08\x0b-\x1f\x7f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function canonicalizeCommand(value: string): string {
  const normalized = normalizeCommand(value);
  if (normalized === "pnpm i") return "pnpm install";

  if (normalized.startsWith("cd ")) {
    const rawPath = normalized.slice(3).trim();
    if (rawPath === "/") return "cd /";
    const cleanedPath = rawPath
      .replace(/\/+$/, "")
      .replace(/^\.\//, "");
    return `cd ${cleanedPath || rawPath}`;
  }

  return normalized;
}

export function isCommandMatch(executed: string, expected: string): boolean {
  return canonicalizeCommand(executed) === canonicalizeCommand(expected);
}

export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Registers a batch of window event listeners and returns a cleanup function
 * that removes all of them. Useful for onMount/onDestroy pairs.
 */
export function registerWindowListeners(
  listeners: Array<[string, EventListenerOrEventListenerObject, (boolean | AddEventListenerOptions)?]>
): () => void {
  for (const [type, handler, options] of listeners) {
    window.addEventListener(type, handler, options);
  }
  return () => {
    for (const [type, handler, options] of listeners) {
      window.removeEventListener(type, handler, options);
    }
  };
}
