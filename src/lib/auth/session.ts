'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MOCK_USERS } from './mock-users';
import { SESSION_COOKIE_NAME, SessionData } from './constants';

/**
 * Validates credentials against mock users and sets httpOnly session cookie.
 */
export async function loginAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const username = (formData.get('username') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Please enter both username and password.' };
  }

  const user = MOCK_USERS.find(
    (u) => u.username.toLowerCase() === username && u.passwordHash === password
  );

  if (!user) {
    return { error: 'Invalid institutional credentials. Please check username or password.' };
  }

  const sessionData: SessionData = {
    userId: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    initials: user.initials,
    loginAt: new Date().toISOString(),
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 hours
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
 * Reads and verifies the current session cookie.
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value) as SessionData;
  } catch {
    return null;
  }
}
