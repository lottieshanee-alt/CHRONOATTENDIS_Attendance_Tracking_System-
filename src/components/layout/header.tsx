'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Volume2,
  VolumeX,
  Scan,
  Clock,
  Shield,
  Download,
  Filter,
} from 'lucide-react';
import { cn, formatTime, formatDate } from '@/lib/utils';

interface HeaderProps {
  scannerReady: boolean;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onOpenScannerStation: () => void;
  onOpenExportDialog?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({
  scannerReady,
  audioEnabled,
  onToggleAudio,
  onOpenScannerStation,
  onOpenExportDialog,
  searchQuery,
  onSearchChange,
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
    <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-20">
      {/* Left: Department & Campus Info */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-[#0A1C33] tracking-tight">
              Institutional Attendance Operations
            </h1>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E3ECF7] text-[#0E294B] border border-[#CBD5E1]">
              AY 2026–2027 • 1st Semester
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            John B. Lacson Colleges Foundation – Bacolod Campus (Mambulac, Silay & Alijis Route)
          </p>
        </div>
      </div>

      {/* Right Controls: Real-time Clock, Scanner Trigger, Audio Toggle, Search */}
      <div className="flex items-center gap-3">
        {/* Real-time Institutional PHT Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
          <Clock size={14} className="text-[#0E294B]" />
          <span className="font-semibold text-slate-900">
            {currentDate ? formatTime(currentDate) : '--:--:-- --'}
          </span>
          <span className="text-slate-400">PHT</span>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-48 md:w-64">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search student ID, cadet, section..."
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
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#0E294B] hover:bg-[#143765] text-white text-xs font-semibold shadow-sm transition-colors border border-[#0A1C33]"
        >
          <Scan size={14} className="text-[#DEB033]" />
          <span className="hidden sm:inline">Scanner Station</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 status-indicator-live" />
        </button>

        {/* Quick Report Download / Export */}
        {onOpenExportDialog && (
          <button
            type="button"
            onClick={onOpenExportDialog}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
            title="Export Attendance Report"
          >
            <Download size={14} className="text-slate-600" />
            <span>Export Roster</span>
          </button>
        )}
      </div>
    </header>
  );
}
