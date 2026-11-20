'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Volume2,
  VolumeX,
  Scan,
  Clock,
  Menu,
} from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import {
  MOCK_ACADEMIC_TERM,
  MOCK_CAMPUS_NAME,
  MOCK_CAMPUS_LOCATION,
} from '@/lib/mock-data';

interface HeaderProps {
  scannerReady?: boolean;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onOpenScannerStation: () => void;
  onOpenExportDialog?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenMobileMenu?: () => void;
}

export function Header({
  scannerReady = true,
  audioEnabled,
  onToggleAudio,
  onOpenScannerStation,
  searchQuery,
  onSearchChange,
  onOpenMobileMenu,
}: HeaderProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setCurrentDate(new Date()));
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(interval);
    };
  }, []);

  return (
          <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
            {/* Left: Mobile Menu Toggle & Campus Info */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Hamburger Toggle Button (A1) */}
              <button
                type="button"
                onClick={onOpenMobileMenu}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E294B] shrink-0"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <h1 className="text-sm sm:text-base md:text-lg font-bold text-[#0A1C33] tracking-tight truncate">
                      Attendance Operations
                    </h1>
                      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E3ECF7] text-[#0E294B] border border-[#CBD5E1] shrink-0">
                        {MOCK_ACADEMIC_TERM}
                      </span>
                    </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                        {MOCK_CAMPUS_NAME} ({MOCK_CAMPUS_LOCATION})
                      </p>
                    </div>
                </div>

                {/* Right Controls: Real-time Clock, Scanner Trigger, Audio Toggle, Search */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Real-time Institutional PHT Clock */}
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
                      <Clock size={14} className="text-[#0E294B]" />
                      <span className="font-semibold text-slate-900">
                        {currentDate ? formatTime(currentDate) : '--:--:-- --'}
                      </span>
                      <span className="text-slate-400">PHT</span>
                    </div>

                    {/* Global Search Bar */}
                      <div className="relative w-36 sm:w-48 md:w-64">
                        <Search
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => onSearchChange(e.target.value)}
                          placeholder="Search ID, name, section..."
                          aria-label="Search student ID, cadet name, or section"
                          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0E294B] focus:border-[#0E294B] transition-colors"
                        />
                      </div>

                      {/* Audio Feedback Button */}
                      <button
                        type="button"
                        onClick={onToggleAudio}
                        className={cn(
                          'p-2 rounded-md border text-xs font-medium transition-colors flex items-center justify-center',
                          audioEnabled
                            ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                            : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                        )}
                        title={audioEnabled ? 'Hardware Beep: Enabled' : 'Hardware Beep: Muted'}
                        aria-label={audioEnabled ? 'Mute scanner audio' : 'Enable scanner audio'}
                      >
                        {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      </button>

                      {/* Barcode Scanner Modal Launch Button */}
                      <button
                        type="button"
                        onClick={onOpenScannerStation}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0E294B] hover:bg-[#143765] text-white text-xs font-semibold shadow-sm transition-colors border border-[#0A1C33]"
                        title={scannerReady ? 'Scanner listener active' : 'Scanner listener offline'}
                        aria-label="Open Barcode Scanner Station"
                      >
                        <Scan size={14} className="text-[#DEB033]" />
                        <span className="hidden sm:inline font-mono">F9 / SCAN</span>
                      </button>
                    </div>
                  </header>
                  );
}
