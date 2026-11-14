import React from 'react';
import type { Metadata } from 'next';
import { FileQuestion } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Page Not Found | ChronoAttendis',
  description: 'The requested page could not be found on ChronoAttendis.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-[#0a1c33] justify-center items-center p-6">
      <Container className="max-w-md text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#0e294b]/10 border border-[#0e294b]/20 flex items-center justify-center mx-auto text-[#0e294b]">
          <FileQuestion size={32} />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-[#c99313] uppercase tracking-wider">
            HTTP Error 404
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            The requested institutional record or URL path is not available or has been relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button href="/" variant="primary" size="md">
            <span>Return to Landing Page</span>
          </Button>
          <Button href="/dashboard" variant="secondary" size="md">
            <span>Go to Dashboard</span>
          </Button>
        </div>
      </Container>
    </div>
  );
}

