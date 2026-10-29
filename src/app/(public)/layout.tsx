import React from 'react';
import { Source_Serif_4, Inter } from 'next/font/google';
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

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        sourceSerif4.variable,
        inter.variable,
        'min-h-screen flex flex-col font-sans bg-[#f8fafc] text-[#0f172a] antialiased selection:bg-[#0e294b] selection:text-white'
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0a1c33] focus:text-[#c99313] focus:border-2 focus:border-[#c99313] focus:rounded-md focus:shadow-floating focus:outline-none"
      >
        Skip to content
      </a>
      {children}
    </div>
  );
}
