import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { AttendanceStoreProvider } from '@/state/attendance-store';
import { getSession } from '@/lib/auth/session';
import { Skeleton } from '@/components/ui/skeleton';

async function AuthGuard({ children }: { children: React.ReactNode }) {
  // Verified HMAC-SHA-256 session token with expiration check (N4)
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <AttendanceStoreProvider initialSession={session}>
      {children}
    </AttendanceStoreProvider>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans items-center justify-center">
          <div className="space-y-4 p-8 w-full max-w-sm">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      }
    >
      <AuthGuard>{children}</AuthGuard>
    </Suspense>
  );
}
