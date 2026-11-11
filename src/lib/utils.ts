import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatTimePHT, formatDatePHT } from './time';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format time in Asia/Manila (PHT) timezone.
 */
export function formatTime(date: Date | string | null | undefined): string {
  return formatTimePHT(date);
}

/**
 * Format date in Asia/Manila (PHT) timezone.
 */
export function formatDate(date: Date | string | null | undefined): string {
  return formatDatePHT(date);
}
