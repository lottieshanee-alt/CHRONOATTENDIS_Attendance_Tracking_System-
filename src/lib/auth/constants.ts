export const SESSION_COOKIE_NAME = 'chrono_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours
export const DEFAULT_DEV_SESSION_SECRET = 'chronoattendis-prototype-secret-key-32-chars-jblcf-2026';

export interface SessionData {
  userId: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
  department: string;
  initials: string;
  loginAt: string;
  expiresAt: number; // Unix timestamp ms
}

export interface LoginActionResult {
  error?: string;
  lockedUntilSeconds?: number;
}
