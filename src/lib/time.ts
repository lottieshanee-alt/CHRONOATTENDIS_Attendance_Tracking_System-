/**
 * Asia/Manila (PHT, UTC+8) time utilities.
 * All attendance timestamps and comparisons must use this timezone.
 */

export const MANILA_TIMEZONE = 'Asia/Manila';

/**
 * Returns current date/time converted to Manila timezone.
 */
export function getManilaNow(): Date {
  return new Date();
}

/**
 * Returns an ISO 8601 string with Asia/Manila offset (+08:00).
 * Example: "2026-10-22T07:18:24+08:00"
 */
export function toManilaISO(input: Date | string | number = new Date()): string {
  const date = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
  if (isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  // Use Intl.DateTimeFormat to reliably extract Manila parts regardless of host timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: MANILA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '00';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  let hour = getPart('hour');
  if (hour === '24') hour = '00';
  const minute = getPart('minute');
  const second = getPart('second');

  return `${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`;
}

/**
 * Extracts the Manila hour and minute (24-hour) from a Date or ISO string.
 */
export function getManilaTimeParts(input: Date | string): {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  dateKey: string;
} {
  const date = typeof input === 'string' ? new Date(input) : input;
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: MANILA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parseInt(parts.find((p) => p.type === type)?.value || '0', 10);

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  let hours = getPart('hour');
  if (hours === 24) hours = 0;
  const minutes = getPart('minute');
  const seconds = getPart('second');

  const pad = (n: number) => String(n).padStart(2, '0');
  const dateKey = `${year}-${pad(month)}-${pad(day)}`;

  return { year, month, day, hours, minutes, seconds, dateKey };
}

/**
 * Formats time in 12-hour format with AM/PM in Asia/Manila.
 * e.g. "07:18:24 AM"
 */
export function formatTimePHT(input: Date | string | null | undefined): string {
  if (!input) return '--:--:-- --';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return String(input);

  return date.toLocaleTimeString('en-US', {
    timeZone: MANILA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Formats date in long format in Asia/Manila.
 * e.g. "Thursday, October 22, 2026"
 */
export function formatDatePHT(input: Date | string | null | undefined): string {
  if (!input) return '';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    timeZone: MANILA_TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats date in short format in Asia/Manila.
 * e.g. "Oct 22, 2026"
 */
export function formatShortDatePHT(input: Date | string | null | undefined): string {
  if (!input) return '';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    timeZone: MANILA_TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats combined date and time in Asia/Manila.
 * e.g. "Oct 22, 2026, 07:18 AM"
 */
export function formatDateTimePHT(input: Date | string | null | undefined): string {
  if (!input) return '';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return '';

  return date.toLocaleString('en-US', {
    timeZone: MANILA_TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Checks if a given timestamp is late relative to a lateCutoffTime ("HH:MM", 24-hr).
 * Default cutoff is "07:45".
 * Any second after HH:MM:00 (i.e. >= cutoff hour and minute > 0, or equal hour and minute >= cutoff minute) is marked late.
 */
export function isLatePHT(input: Date | string, lateCutoffTime: string = '07:45'): boolean {
  const { hours, minutes, seconds } = getManilaTimeParts(input);
  const [cutoffHStr, cutoffMStr] = lateCutoffTime.split(':');
  const cutoffHours = parseInt(cutoffHStr, 10);
  const cutoffMinutes = parseInt(cutoffMStr, 10);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const cutoffSeconds = cutoffHours * 3600 + cutoffMinutes * 60;

  return totalSeconds > cutoffSeconds;
}

