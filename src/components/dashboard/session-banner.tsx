'use client';

import React from 'react';
import { Session, Student, AttendanceRecord } from '@/types/attendance';
import { Play, CheckCircle2, Clock, XCircle, Users, Scan, AlertCircle } from 'lucide-react';
import { formatTimePHT } from '@/lib/time';

interface SessionBannerProps {
  activeSession: Session | null;
  students: Student[];
  records: AttendanceRecord[];
  onOpenNewSession: () => void;
  onOpenScanner: () => void;
  onRequestCloseSession: () => void;
}

export function SessionBanner({
  activeSession,
  students,
  records,
  onOpenNewSession,
  onOpenScanner,
  onRequestCloseSession,
}: SessionBannerProps) {
  // If no active session, render the clear "Start taking attendance" primary callout
  if (!activeSession) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-[#0E294B]/40 transition-colors">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#E3ECF7] border border-[#CBD5E1] flex items-center justify-center shrink-0 text-[#0E294B]">
            <Play size={20} className="ml-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#0A1C33]">
                No Attendance Session Active
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Open a session for a class, muster, or formation to attach incoming barcode scans to an official roster.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNewSession}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0E294B] hover:bg-[#143765] text-white text-xs font-bold rounded-md shadow-sm transition-colors shrink-0"
        >
          <Play size={14} className="text-[#DEB033]" />
          <span>Start Taking Attendance</span>
        </button>
      </div>
    );
  }

  // Active Session Banner
  const enrolledCount = students.filter(
    (s) => s.isActive && (activeSession.section === 'All Sections' || s.yearSection === activeSession.section)
  ).length;

  const sessionRecords = records.filter(
    (r) => !r.voidedAt && r.sessionId === activeSession.id
  );
  const presentCount = sessionRecords.filter(
    (r) => r.status === 'present' || r.status === 'late'
  ).length;
  const lateCount = sessionRecords.filter((r) => r.status === 'late').length;

  return (
    <div className="bg-[#0A1C33] text-white rounded-lg p-5 shadow-md border border-[#143765] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Session details */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div className="relative shrink-0 mt-0.5 sm:mt-0">
          <div className="w-10 h-10 rounded-lg bg-[#0E294B] border border-[#1B4780] flex items-center justify-center text-[#DEB033]">
            <Scan size={20} />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0A1C33] status-indicator-live" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Session
            </span>
            <span className="text-xs font-bold text-slate-300">
              {activeSession.section}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
              <Clock size={12} className="text-[#DEB033]" />
              Cutoff: {activeSession.lateCutoffTime}
            </span>
          </div>

          <h2 className="text-base font-bold text-white tracking-tight truncate mt-0.5">
            {activeSession.subject}
          </h2>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
            <span>Opened at {formatTimePHT(activeSession.openedAt)}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 size={12} />
              {presentCount} Checked In
            </span>
            {lateCount > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <AlertCircle size={12} />
                  {lateCount} Late
                </span>
              </>
            )}
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Users size={12} />
              {enrolledCount} Enrolled
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action controls */}
      <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#143765]">
        <button
          type="button"
          onClick={onOpenScanner}
          className="flex items-center gap-2 px-4 py-2 bg-[#DEB033] hover:bg-[#c99e2a] text-[#0A1C33] text-xs font-bold rounded-md shadow-sm transition-colors"
        >
          <Scan size={14} />
          <span>Continue Attendance (F9)</span>
        </button>

        <button
          type="button"
          onClick={onRequestCloseSession}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-md border border-slate-700 transition-colors"
        >
          <XCircle size={14} className="text-rose-400" />
          <span>Close Session</span>
        </button>
      </div>
    </div>
  );
}
