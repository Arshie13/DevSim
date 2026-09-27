/**
 * Date helpers shared by the BookWise dashboard, returns and overdue pages.
 */

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Parses a `YYYY-MM-DD` string into a local Date.
 *
 * Built from parts (rather than `new Date(string)`) so the result does not
 * shift a day when the runtime timezone sits behind UTC.
 */
function parseIsoDate(dateString: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString ?? '');
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return Number.isNaN(date.getTime()) ? null : date;
}

/** Formats an ISO date as `Jan 15, 2026`; returns `''` for invalid input. */
export function formatDate(dateString: string): string {
  const date = parseIsoDate(dateString);
  if (!date) return '';

  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** True when the given date falls before today. Invalid input is never overdue. */
export function isOverdue(dateString: string): boolean {
  const date = parseIsoDate(dateString);
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date.getTime() < today.getTime();
}
