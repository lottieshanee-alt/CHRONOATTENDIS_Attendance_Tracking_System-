import { AttendanceStoreProvider } from '@/state/attendance-store';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AttendanceStoreProvider>{children}</AttendanceStoreProvider>;
}

