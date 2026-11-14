import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AttendanceStoreProvider } from '@/state/attendance-store';
import { SESSION_COOKIE_NAME } from '@/lib/auth/constants';
import { Skeleton } from '@/components/ui/skeleton';

async function AuthGuard({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);

  if (!session?.value) {
    redirect('/login');
  }

  return <>{children}</>;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AttendanceStoreProvider>
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
    </AttendanceStoreProvider>
  );
}
