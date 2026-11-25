'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Session, Student, AttendanceRecord } from '@/types/attendance';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { deriveAbsences } from '@/lib/session';

interface CloseSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  students: Student[];
  records: AttendanceRecord[];
  onConfirmClose: (sessionId: string) => Promise<void>;
}

export function CloseSessionModal({
  isOpen,
  onClose,
  session,
  students,
  records,
  onConfirmClose,
}: CloseSessionModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  if (!session) return null;

  // Calculate preview of derived absences
  const previewAbsences = deriveAbsences(session, students, records);
  const enrolledCount = students.filter(
    (s) => s.isActive && (session.section === 'All Sections' || s.yearSection === session.section)
  ).length;
  const presentCount = enrolledCount - previewAbsences.length;

  const handleConfirm = async () => {
    setIsClosing(true);
    try {
      await onConfirmClose(session.id);
      onClose();
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Close Attendance Session"
      description="Finalize this session and mark absences for unverified cadets."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Warning callout */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>Are you sure you want to close this session?</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            Closing will finalize the roster for <strong>{session.subject}</strong> (
            {session.section}). No further barcode scans can be attached to this session.
          </p>
        </div>

        {/* Turnout summary breakdown */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold mb-1">
              <CheckCircle size={14} className="text-emerald-600" />
              <span>Turnout Recorded</span>
            </div>
            <p className="text-xl font-bold font-mono text-emerald-900">
              {presentCount} <span className="text-xs font-normal text-slate-500">/ {enrolledCount}</span>
            </p>
          </div>

          <div className="p-3 rounded-md bg-rose-50 border border-rose-200">
            <div className="flex items-center gap-1.5 text-rose-800 font-semibold mb-1">
              <Clock size={14} className="text-rose-600" />
              <span>Unexcused Absences</span>
            </div>
            <p className="text-xl font-bold font-mono text-rose-900">
              {previewAbsences.length}
            </p>
            <p className="text-[11px] text-rose-700 mt-0.5">
              Will be recorded as absent
            </p>
          </div>
        </div>

        {/* Modal actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isClosing}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-md shadow-sm transition-colors disabled:opacity-50"
          >
            {isClosing ? 'Finalizing Roster...' : 'Close Session & Mark Absences'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
