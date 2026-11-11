'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { Student } from '@/types/attendance';
import { Search, UserCheck, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onRecordManualAttendance: (
    student: Student,
    status: 'present' | 'late',
    reason: string,
    notes?: string
  ) => void;
  initialQuery?: string;
}

export const MANUAL_REASONS = [
  'Damaged barcode / unreadable label',
  'Forgot ID card / Badge not present',
  'Hardware scanner malfunction / battery depleted',
  'Special regimental / administrative directive',
  'Temporary pass / cadet replacement credential',
];

export function ManualAttendanceModal({
  isOpen,
  onClose,
  students,
  onRecordManualAttendance,
  initialQuery = '',
}: ManualAttendanceModalProps) {
  const [search, setSearch] = useState(initialQuery);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [status, setStatus] = useState<'present' | 'late'>('present');
  const [reason, setReason] = useState<string>(MANUAL_REASONS[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.isActive !== false &&
        (s.fullName.toLowerCase().includes(q) ||
          s.studentNumber.toLowerCase().includes(q) ||
          s.barcode.includes(q) ||
          s.yearSection.toLowerCase().includes(q))
    );
  }, [students, search]);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError('Please select a student from the directory.');
      return;
    }
    if (!reason.trim()) {
      setError('A mandatory reason is required for manual attendance override.');
      return;
    }

    onRecordManualAttendance(selectedStudent, status, reason, notes.trim());
    handleClose();
  };

  const handleClose = () => {
    setSelectedStudent(null);
    setSearch('');
    setError(null);
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Manual Attendance Override"
      description="Record verified check-in for cadets without a functional barcode or during hardware scanner failure."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Search Directory */}
        <div>
          <label
            htmlFor="manual-student-search"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
          >
            1. Search Cadet / Student Directory
          </label>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="manual-student-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by cadet name, student number (e.g. JBLCF-2024-xxxx), or section..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
            />
          </div>

          {/* Quick results dropdown if not yet selected */}
          {filteredStudents.length > 0 && !selectedStudent && (
            <div className="mt-1 border border-slate-200 rounded-md bg-white shadow-md max-h-48 overflow-y-auto divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectStudent(s)}
                  className="w-full text-left p-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#0A1C33]">{s.fullName}</span>
                    <span className="text-slate-400 ml-2 font-mono">
                      ({s.studentNumber})
                    </span>
                    <p className="text-[11px] text-slate-500">{s.yearSection}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E294B] px-2 py-0.5 rounded bg-[#E3ECF7]">
                    Select
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Student Card */}
        {selectedStudent && (
          <div className="p-3 bg-[#F0F5FA] border border-[#CBD5E1] rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-[#0E294B] text-white flex items-center justify-center font-bold text-xs">
                {selectedStudent.fullName
                  .split(' ')
                  .filter((w) => !w.startsWith('Cadet'))
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0A1C33]">
                  {selectedStudent.fullName}
                </h4>
                <div className="text-[11px] text-slate-500 font-mono">
                  {selectedStudent.studentNumber} • {selectedStudent.yearSection}
                </div>
                <div className="text-[10px] text-slate-400">
                  {selectedStudent.department}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
              className="text-xs text-slate-500 hover:text-red-700 underline"
            >
              Change
            </button>
          </div>
        )}

        {/* Step 2: Attendance Status */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            2. Verified Turnout Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStatus('present')}
              className={cn(
                'p-3 rounded-lg border text-left flex items-center gap-3 transition-all',
                status === 'present'
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              )}
            >
              <UserCheck
                size={18}
                className={status === 'present' ? 'text-emerald-700' : 'text-slate-400'}
              />
              <div>
                <div className="text-xs font-bold text-[#0A1C33]">
                  Present (On Time)
                </div>
                <div className="text-[10px] text-slate-500">
                  Muster standard satisfied
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStatus('late')}
              className={cn(
                'p-3 rounded-lg border text-left flex items-center gap-3 transition-all',
                status === 'late'
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              )}
            >
              <AlertTriangle
                size={18}
                className={status === 'late' ? 'text-amber-600' : 'text-slate-400'}
              />
              <div>
                <div className="text-xs font-bold text-[#0A1C33]">Late Arrival</div>
                <div className="text-[10px] text-slate-500">
                  Arrived past muster cutoff
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Step 3: Mandatory Reason */}
        <div>
          <label
            htmlFor="manual-reason-select"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
          >
            3. Mandatory Override Reason <span className="text-red-600">*</span>
          </label>
          <select
            id="manual-reason-select"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
          >
            {MANUAL_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Step 4: Optional Remarks */}
        <div>
          <label
            htmlFor="manual-notes-input"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
          >
            4. Officer Notes / Remarks (Optional)
          </label>
          <input
            id="manual-notes-input"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Cadet presented physical clearance slip signed by Deck Officer..."
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
          />
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedStudent}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0E294B] hover:bg-[#143765] disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck size={14} className="text-[#DEB033]" />
            <span>Confirm Manual Attendance</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

