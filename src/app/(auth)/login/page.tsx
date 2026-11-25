import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { getSession } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Terminal Sign In | ChronoAttendis',
  description:
    'Institutional sign-in for faculty and administrative officers at John B. Lacson Colleges Foundation – Bacolod.',
};

async function LoginRedirectGuard() {
  const session = await getSession();

  if (session) {
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
