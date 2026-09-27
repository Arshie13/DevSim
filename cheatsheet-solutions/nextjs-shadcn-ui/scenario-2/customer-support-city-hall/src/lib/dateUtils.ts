/**
 * Shared timestamp helpers for the support portal.
 *
 * Every function returns a safe value for missing or malformed input, and every
 * one accepts either a Date or the ISO string produced by localStorage.
 */

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/** A conversation untouched for this long is considered stale. */
export const STALE_AFTER_MS = MS_PER_DAY;

/** Normalises a Date | string, returning null when it is not a valid date. */
function parseDate(value: Date | string): Date | null {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "Just now" / "5m ago" / "3h ago", falling back to a plain date. */
export function formatRelativeTime(value: Date | string): string {
  const date = parseDate(value);
  if (!date) return '';

  const elapsed = Date.now() - date.getTime();

  if (elapsed < MS_PER_MINUTE) return 'Just now';
  if (elapsed < MS_PER_HOUR) return `${Math.floor(elapsed / MS_PER_MINUTE)}m ago`;
  if (elapsed < MS_PER_DAY) return `${Math.floor(elapsed / MS_PER_HOUR)}h ago`;

  return date.toLocaleDateString();
}

/** True once the timestamp is older than `maxAgeMs`. Invalid input is not stale. */
export function isStale(value: Date | string, maxAgeMs: number = STALE_AFTER_MS): boolean {
  const date = parseDate(value);
  if (!date) return false;

  return Date.now() - date.getTime() > maxAgeMs;
}

/** An absolute, readable timestamp. Returns '' for invalid input. */
export function formatTimestamp(value: Date | string): string {
  const date = parseDate(value);
  if (!date) return '';

  return date.toLocaleString();
}
