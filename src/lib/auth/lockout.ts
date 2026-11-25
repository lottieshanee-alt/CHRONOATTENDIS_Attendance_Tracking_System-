/**
 * In-memory brute force throttling & account lockout for ChronoAttendis (N5).
 * Enforces a 30-second lockout after 5 consecutive failed attempts.
 */

interface AttemptRecord {
  failures: number;
  lockedUntil: number; // Unix timestamp ms
}

const attemptsStore = new Map<string, AttemptRecord>();

const MAX_FAILURES = 5;
const LOCKOUT_DURATION_MS = 30_000; // 30 seconds

export function checkLockout(identifier: string): { isLocked: boolean; remainingSeconds: number } {
  const key = identifier.toLowerCase().trim();
  const record = attemptsStore.get(key);

  if (!record) {
    return { isLocked: false, remainingSeconds: 0 };
  }

  const now = Date.now();
  if (record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLocked: true, remainingSeconds };
  }

  // If lockout has elapsed, reset
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    attemptsStore.delete(key);
  }

  return { isLocked: false, remainingSeconds: 0 };
}

export function recordFailedAttempt(identifier: string): { isLocked: boolean; remainingSeconds: number; failures: number } {
  const key = identifier.toLowerCase().trim();
  const now = Date.now();
  const existing = attemptsStore.get(key) || { failures: 0, lockedUntil: 0 };

  const failures = existing.failures + 1;
  let lockedUntil = 0;
  let isLocked = false;
  let remainingSeconds = 0;

  if (failures >= MAX_FAILURES) {
    lockedUntil = now + LOCKOUT_DURATION_MS;
    isLocked = true;
    remainingSeconds = Math.ceil(LOCKOUT_DURATION_MS / 1000);
  }

  attemptsStore.set(key, { failures, lockedUntil });
  return { isLocked, remainingSeconds, failures };
}

export function resetAttempts(identifier: string): void {
  const key = identifier.toLowerCase().trim();
  attemptsStore.delete(key);
}

export const clearAttempts = resetAttempts;

export function isLockedOut(identifier: string): boolean {
  return checkLockout(identifier).isLocked;
}

export function getRemainingLockoutSeconds(identifier: string): number {
  return checkLockout(identifier).remainingSeconds;
}
