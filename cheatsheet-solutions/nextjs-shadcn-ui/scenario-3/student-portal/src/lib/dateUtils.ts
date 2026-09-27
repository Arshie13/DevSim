/**
 * Date helpers for the student portal's fee deadlines.
 *
 * Every function returns a safe value for missing or malformed input so the UI
 * never renders "Invalid Date".
 */

/** Parses a YYYY-MM-DD (or ISO) string into a local Date at midnight. */
function parseToLocalDate(value: string): Date | null {
  if (!value) return null;

  const isoDay = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const date = isoDay
    ? new Date(Number(isoDay[1]), Number(isoDay[2]) - 1, Number(isoDay[3]))
    : new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  date.setHours(0, 0, 0, 0);
  return date;
}

/** Today at local midnight. */
function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/** Whole calendar days between today and the given date (negative when past). */
export function daysUntilDue(dueDate: string): number {
  const due = parseToLocalDate(dueDate);
  if (!due) return 0;

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((due.getTime() - startOfToday().getTime()) / msPerDay);
}

/** True when the due date is strictly before today. */
export function isOverdue(dueDate: string): boolean {
  const due = parseToLocalDate(dueDate);
  if (!due) return false;

  return due.getTime() < startOfToday().getTime();
}

/** Human-readable due-date copy, or '' when the input is invalid. */
export function formatDueDate(dueDate: string): string {
  const due = parseToLocalDate(dueDate);
  if (!due) return '';

  const diff = daysUntilDue(dueDate);

  if (diff === 0) return 'Due Today';
  if (diff === 1) return 'Due Tomorrow';
  if (diff > 1 && diff <= 7) return `Due in ${diff} days`;
  if (diff < 0) return `Overdue by ${Math.abs(diff)} days`;

  return due.toLocaleDateString();
}
