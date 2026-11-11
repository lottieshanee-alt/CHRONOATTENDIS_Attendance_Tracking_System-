'use client';

import React from 'react';
import {
  X,
  QrCode,
  User,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { AttendanceRecord } from '@/types/attendance';
import { formatTimePHT, formatDatePHT } from '@/lib/time';
import { cn } from '@/lib/utils';

interface RecordDetailDrawerProps {
  record: AttendanceRecord;
  onClose: () => void;
}

export function RecordDetailDrawer({
  record,
  onClose,
}: RecordDetailDrawerProps) {
  const isLate = record.status === 'late';
  const isTimeOut = record.scanType === 'time-out';
  const isManual = record.verificationMethod === 'MANUAL_OVERRIDE';
  const isVoided = !!record.voidedAt;

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Attendance Record Detail"
        className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-[#0A1C33]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Record Detail
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-[#143765] rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Status badge row */}
          <div className="flex items-center gap-2 flex-wrap">
            {isVoided ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-300">
                VOIDED
              </span>
            ) : isTimeOut ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#E3ECF7] text-[#0E294B] border border-[#CBD5E1]">
                <LogOut size={12} />
                TIME OUT
              </span>
            ) : isLate ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <AlertTriangle size={12} />
                LATE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                <CheckCircle2 size={12} />
                ON TIME
              </span>
            )}
            {isManual && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                <ShieldCheck size={10} />
                MANUAL OVERRIDE
              </span>
            )}
          </div>

          {/* Student info */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-500 font-semibold mb-2">
              <User size={13} className="text-[#0E294B]" />
              <span className="uppercase tracking-wider text-[11px]">
                Student
              </span>
            </div>
            <p className="font-bold text-[#0A1C33] text-sm">{record.studentName}</p>
            <p className="text-slate-500 font-mono">{record.studentNumber}</p>
            <p className="text-[#0E294B] font-semibold">{record.yearSection}</p>
            <p className="text-slate-500">{record.department}</p>
          </div>

          {/* Scan info */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-500 font-semibold mb-2">
              <Clock size={13} className="text-[#0E294B]" />
              <span className="uppercase tracking-wider text-[11px]">
                Scan Info
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-mono font-semibold text-[#0A1C33]">
                  {formatDatePHT(record.timestamp)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time (PHT)</span>
                <span className="font-mono font-semibold text-[#0A1C33]">
                  {formatTimePHT(record.timestamp)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scan type</span>
                <span
                  className={cn(
                    'font-semibold capitalize',
                    record.scanType === 'time-in'
                      ? 'text-emerald-700'
                      : 'text-[#0E294B]'
                  )}
                >
                  {record.scanType.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Gate / Location */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-500 font-semibold mb-2">
              <MapPin size={13} className="text-[#0E294B]" />
              <span className="uppercase tracking-wider text-[11px]">
                Gate / Station
              </span>
            </div>
            <p className="font-semibold text-[#0A1C33]">
              {record.scannerLocation}
            </p>
          </div>

          {/* Verification method */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-500 font-semibold mb-2">
              <QrCode size={13} className="text-[#0E294B]" />
              <span className="uppercase tracking-wider text-[11px]">
                Verification
              </span>
            </div>
            <p className="font-semibold text-[#0A1C33]">
              {record.verificationMethod === 'BARCODE_HID'
                ? 'Barcode (HID Scanner)'
                : 'Manual Override'}
            </p>
            {record.manualReason && (
              <p className="text-slate-500 italic">{record.manualReason}</p>
            )}
          </div>

          {/* Void info */}
          {isVoided && (
            <div className="bg-red-50 rounded-lg border border-red-200 p-4 space-y-1 text-xs">
              <p className="font-bold text-red-800">Record Voided</p>
              {record.voidedAt && (
                <p className="text-red-600 font-mono">
                  {formatTimePHT(record.voidedAt)}
                </p>
              )}
              {record.voidReason && (
                <p className="text-red-700">{record.voidReason}</p>
              )}
            </div>
          )}

          {/* Record ID */}
          <p className="text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100">
            ID: {record.id}
          </p>
        </div>
      </aside>
    </>
  );
}

