import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { SESSION_COOKIE_NAME } from '@/lib/auth/constants';

export const metadata: Metadata = {
  title: 'Terminal Sign In | ChronoAttendis',
  description:
    'Institutional sign-in for faculty and administrative officers at John B. Lacson Colleges Foundation – Bacolod.',
};

async function LoginRedirectGuard() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);

  if (session?.value) {
    redirect('/dashboard');
  }

  return null;
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Suspense fallback={null}>
        <LoginRedirectGuard />
      </Suspense>
      <LoginForm />
    </div>
  );
}
