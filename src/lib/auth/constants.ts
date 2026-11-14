export const SESSION_COOKIE_NAME = 'chrono_session';

export interface SessionData {
  userId: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
  department: string;
  initials: string;
  loginAt: string;
}

