import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChronoAttendis | Attendance Tracking System - JBLCF Bacolod',
  description: 'Official Attendance Tracking and Student Monitoring System for John B. Lacson Colleges Foundation – Bacolod.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-[#0e294b] selection:text-white">
        {children}
      </body>
    </html>
  );
}
