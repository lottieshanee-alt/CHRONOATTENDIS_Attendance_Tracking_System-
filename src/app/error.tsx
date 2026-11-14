'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('ChronoAttendis uncaught error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-[#0a1c33] justify-center items-center p-6">
      <Container className="max-w-md text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
          <AlertTriangle size={32} />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-amber-800 uppercase tracking-wider">
            Operational Exception
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            An unexpected error occurred
          </h1>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            The application encountered a render or state disruption. You may attempt to recover the active session or return to the landing overview.
          </p>
          {error.digest && (
            <p className="font-mono text-[11px] text-slate-400">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#0e294b] hover:bg-[#143765] text-white text-xs font-bold shadow-sm transition-colors"
          >
            <RotateCcw size={14} />
            <span>Attempt Recovery</span>
          </button>

          <Button href="/" variant="secondary" size="md">
            <Home size={14} />
            <span>Return to Home</span>
          </Button>
        </div>
      </Container>
    </div>
  );
}

