import React from 'react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#0f172a] antialiased selection:bg-[#0e294b] selection:text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0a1c33] focus:text-[#c99313] focus:border-2 focus:border-[#c99313] focus:rounded-[8px] focus:shadow-floating focus:outline-none"
      >
        Skip to content
      </a>
      {children}
    </div>
  );
}
