'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MOCK_USERS } from './mock-users';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  SessionData,
  LoginActionResult,
} from './constants';
import { signSessionPayload, verifySessionToken } from './crypto';
import { checkLockout, recordFailedAttempt, resetAttempts } from './lockout';

/**
 * Validates credentials against institutional directory with rate-limiting & signed cookies.
 */
export async function loginAction(
  prevState: LoginActionResult | null,
  formData: FormData
): Promise<LoginActionResult> {
  const username = (formData.get('username') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Please enter both institutional username and password.' };
  }

  // 1. Check account lockout (N5)
  const lockoutStatus = checkLockout(username);
  if (lockoutStatus.isLocked) {
    return {
      error: `Too many failed attempts. Account temporarily locked for security. Please wait ${lockoutStatus.remainingSeconds}s.`,
      lockedUntilSeconds: lockoutStatus.remainingSeconds,
    };
  }

  // 2. Validate against mock institutional directory
  const user = MOCK_USERS.find(
    (u) => u.username.toLowerCase() === username && u.passwordHash === password
  );

  if (!user) {
    const attempt = recordFailedAttempt(username);
    if (attempt.isLocked) {
      return {
        error: `5 consecutive failed attempts reached. Account locked for 30 seconds.`,
        lockedUntilSeconds: attempt.remainingSeconds,
      };
    }
    const remainingBeforeLock = 5 - attempt.failures;
    return {
      error: `Invalid credentials. Please verify your password (${remainingBeforeLock} attempt${remainingBeforeLock === 1 ? '' : 's'} remaining before lockout).`,
    };
  }

  // 3. Reset failed attempts upon successful authentication
  resetAttempts(username);

  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const sessionData: SessionData = {
    userId: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    initials: user.initials,
    loginAt: new Date().toISOString(),
    expiresAt,
  };

  // 4. Sign session cookie with HMAC-SHA-256 (N4)
  const signedToken = signSessionPayload(sessionData);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect('/dashboard');
}

/**
 * Clears the session cookie and redirects to the login screen.
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect('/login');
}

/**
 * Reads, verifies cryptographic signature, and checks expiry of the session cookie (N4).
 * Returns null if token is forged, altered, or expired.
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const verified = verifySessionToken(sessionCookie.value);
  if (!verified) {
    // Tampered or expired token: clear cookie
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return verified;
}
