'use client';

import React, { useEffect, useMemo } from 'react';
import {
  X,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  QrCode,
  GraduationCap,
} from 'lucide-react';
import { Student, AttendanceRecord } from '@/types/attendance';
import { formatTimePHT, formatDatePHT } from '@/lib/time';
import { cn } from '@/lib/utils';

interface StudentHistoryDrawerProps {
  student: Student;
  records: AttendanceRecord[];
  onClose: () => void;
  onSimulateScan?: (barcode: string) => void;
}

export function StudentHistoryDrawer({
  student,
  records,
  onClose,
  onSimulateScan,
}: StudentHistoryDrawerProps) {
  // Filter records belonging to this student (exclude voided records from positive counts)
  const studentRecords = useMemo(() => {
    return records
      .filter((r) => r.studentId === student.id)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }, [records, student.id]);

  // Compute attendance metrics for this specific cadet/student
  const stats = useMemo(() => {
    const valid = studentRecords.filter((r) => !r.voidedAt);
    const present = valid.filter((r) => r.status === 'present').length;
    const late = valid.filter((r) => r.status === 'late').length;
    const absent = valid.filter((r) => r.status === 'absent').length;
    const excused = valid.filter((r) => r.status === 'excused').length;
    const total = valid.length;

    const rate =
      total > 0
        ? Math.round(((present + late + excused) / total) * 100)
        : 100;

    return { total, present, late, absent, excused, rate };
  }, [studentRecords]);

  // Close on Escape key (A2, A3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const initials = student.fullName
    .split(' ')
    .filter((n) => !n.startsWith('Cadet'))
    .slice(0, 2)
    .map((n) => n[0])
    .join('');

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Attendance History for ${student.fullName}`}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-[#0A1C33] text-white">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-[#DEB033]" size={18} />
            <h2 className="text-sm font-bold tracking-wide uppercase">
              Student Attendance Record
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-[#143765] rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99313]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Cadet Profile Banner */}
          <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <div
              className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border shadow-xs',
                !student.isActive
                  ? 'bg-slate-200 text-slate-500 border-slate-300'
                  : student.gender === 'male'
                  ? 'bg-[#0E294B] text-white border-[#143765]'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              )}
            >
              {initials || 'ST'}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#0A1C33] truncate">
                  {student.fullName}
                </h3>
                {!student.isActive && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">
                    INACTIVE
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-slate-500 mt-0.5">
                {student.studentNumber}
              </p>
              <p className="text-slate-600 text-xs mt-1">
                {student.yearSection} • {student.department}
              </p>
              {student.barcodeRevokedAt && (
                <div className="mt-2 text-[11px] text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded font-semibold">
                  Barcode revoked on {student.barcodeRevokedAt.slice(0, 10)}
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-center">
              <span className="block text-lg font-bold text-[#0E294B]">
                {stats.rate}%
              </span>
              <span className="text-[10px] uppercase font-semibold text-blue-900">
                Rate
              </span>
            </div>
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-center">
              <span className="block text-lg font-bold text-emerald-800">
                {stats.present}
              </span>
              <span className="text-[10px] uppercase font-semibold text-emerald-800">
                Present
              </span>
            </div>
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-center">
              <span className="block text-lg font-bold text-amber-800">
                {stats.late}
              </span>
              <span className="text-[10px] uppercase font-semibold text-amber-800">
                Late
              </span>
            </div>
            <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg text-center">
              <span className="block text-lg font-bold text-red-800">
                {stats.absent}
              </span>
              <span className="text-[10px] uppercase font-semibold text-red-800">
                Absent
              </span>
            </div>
          </div>

          {/* Attendance Log History */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Session Attendance History ({studentRecords.length})
              </span>
              {onSimulateScan && student.isActive && !student.barcodeRevokedAt && (
                <button
                  type="button"
                  onClick={() => onSimulateScan(student.barcode)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0E294B] hover:text-[#C99313] transition-colors"
                >
                  <QrCode size={12} />
                  <span>Test Scan</span>
                </button>
              )}
            </div>

            {studentRecords.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-500">
                <Calendar className="mx-auto mb-2 text-slate-300" size={24} />
                <p className="font-semibold text-xs">No attendance entries recorded</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Scan this cadet&apos;s barcode at the turnstile station or open a class session to begin tracking.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {studentRecords.map((rec) => {
                  const isVoided = Boolean(rec.voidedAt);
                  const isPresent = rec.status === 'present';
                  const isLate = rec.status === 'late';
                  const isAbsent = rec.status === 'absent';
                  const isExcused = rec.status === 'excused';

                  return (
                    <div
                      key={rec.id}
                      className={cn(
                        'p-3 rounded-lg border transition-colors space-y-2',
                        isVoided
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : isPresent
                          ? 'bg-white border-emerald-200 hover:border-emerald-300'
                          : isLate
                          ? 'bg-white border-amber-200 hover:border-amber-300'
                          : isAbsent
                          ? 'bg-white border-red-200 hover:border-red-300'
                          : isExcused
                          ? 'bg-white border-blue-200 hover:border-blue-300'
                          : 'bg-white border-slate-200'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isVoided ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">
                              VOIDED
                            </span>
                          ) : isPresent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 size={11} />
                              PRESENT
                            </span>
                          ) : isLate ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              <AlertTriangle size={11} />
                              LATE
                            </span>
                          ) : isAbsent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                              <XCircle size={11} />
                              ABSENT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              <HelpCircle size={11} />
                              EXCUSED
                            </span>
                          )}
                          <span className="font-semibold text-slate-800 text-xs">
                            {formatDatePHT(rec.timestamp)}
                          </span>
                        </div>

                        <span className="font-mono text-slate-500 text-[11px]">
                          {formatTimePHT(rec.timestamp)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1 truncate">
                          <MapPin size={11} className="text-slate-400 shrink-0" />
                          <span className="truncate">{rec.scannerLocation || 'Gate 1 Turnstile'}</span>
                        </div>
                        <div className="text-right font-mono text-slate-400 truncate">
                          {rec.verificationMethod}
                        </div>
                      </div>

                      {rec.voidedAt && (
                        <div className="text-[10px] text-slate-500 italic bg-slate-100 p-1.5 rounded">
                          Voided: &ldquo;{rec.voidReason}&rdquo; by {rec.voidedBy}
                        </div>
                      )}
                      {rec.manualReason && (
                        <div className="text-[10px] text-slate-600 bg-amber-50 p-1.5 rounded border border-amber-100">
                          Note: {rec.manualReason}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
            <QrCode size={13} className="text-slate-400" />
            <span>{student.barcode}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E294B]"
          >
            Close
          </button>
        </div>
      </aside>
    </>
  );
}
