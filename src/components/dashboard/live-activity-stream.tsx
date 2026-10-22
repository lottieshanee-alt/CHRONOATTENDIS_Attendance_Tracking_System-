'use client';

import React, { useState } from 'react';
import {
  AttendanceRecord,
  AttendanceStatus,
  ScanType,
} from '@/types/attendance';
import {
  UserCheck,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  LogOut,
  LogIn,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveActivityStreamProps {
  records: AttendanceRecord[];
  onOpenRecordDetail?: (record: AttendanceRecord) => void;
  highlightedId?: string | null;
}

export function LiveActivityStream({
  records,
  onOpenRecordDetail,
  highlightedId,
}: LiveActivityStreamProps) {
  const [filter, setFilter] = useState<'all' | 'present' | 'late' | 'time-out'>('all');

  const filteredRecords = records.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'time-out') return r.scanType === 'time-out';
    if (filter === 'present') return r.status === 'present' && r.scanType === 'time-in';
    if (filter === 'late') return r.status === 'late';
    return true;
  });

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 status-indicator-live" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A1C33]">
            Today&apos;s Live Activity Stream
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            ({records.length} records logged)
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1">
          {(['all', 'present', 'late', 'time-out'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={cn(
                'px-2 py-0.5 text-xs rounded font-medium transition-colors capitalize',
                filter === mode
                  ? 'bg-[#0E294B] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {mode === 'all' ? 'All Logs' : mode.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Stream List */}
      <div className="my-3 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredRecords.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No attendance activity matching current filter.
          </div>
        ) : (
          filteredRecords.map((rec) => {
            const isHighlighted = highlightedId === rec.id;
            const isLate = rec.status === 'late';
            const isTimeOut = rec.scanType === 'time-out';

            return (
              <div
                key={rec.id}
                onClick={() => onOpenRecordDetail?.(rec)}
                className={cn(
                  'p-3 rounded-md border transition-all text-xs flex items-center justify-between gap-3 cursor-pointer',
                  isHighlighted
                    ? 'border-[#C99313] bg-[#FFFDF5] ring-2 ring-[#C99313]/30 shadow-sm'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300'
                )}
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-md flex items-center justify-center font-bold text-xs shrink-0 border',
                      rec.gender === 'male'
                        ? 'bg-[#0E294B] text-white border-[#143765]'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    )}
                  >
                    {rec.studentName
                      .split(' ')
                      .filter((n) => !n.startsWith('Cadet'))
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0A1C33] truncate">
                        {rec.studentName}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 shrink-0">
                        {rec.studentNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-0.5">
                      <span className="font-medium text-[#0E294B]">
                        {rec.yearSection}
                      </span>
                      <span className="truncate flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400" />
                        {rec.scannerLocation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Timestamp & Status Badge */}
                <div className="flex flex-col items-end gap-1 shrink-0 font-mono">
                  <div className="flex items-center gap-1.5">
                    {isTimeOut ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#E3ECF7] text-[#0E294B] border border-[#CBD5E1]">
                        <LogOut size={10} />
                        TIME OUT
                      </span>
                    ) : isLate ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <AlertTriangle size={10} />
                        LATE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <CheckCircle2 size={10} />
                        ON TIME
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-600 font-semibold">
                    {rec.timestamp}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <QrCode size={13} className="text-[#0E294B]" />
          Listening to HID Barcode Scanners on Gates 1, 2, and 3
        </span>
        <span className="font-semibold text-slate-700">Auto-Refreshed</span>
      </div>
    </div>
  );
}
