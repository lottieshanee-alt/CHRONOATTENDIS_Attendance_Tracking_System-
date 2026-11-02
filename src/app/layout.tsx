import type { Metadata } from 'next';
import { Source_Serif_4, Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ui',
  weight: ['400', '500', '600', '700'],
});

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
    <html lang="en" className={cn('h-full', sourceSerif4.variable, inter.variable)}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-[#0e294b] selection:text-white">
        {children}
      </body>
    </html>
  );
}
