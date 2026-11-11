'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import {
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  Activity,
  UserCheck,
} from 'lucide-react';
import { INITIAL_STUDENTS } from '@/lib/mock-data';
import { Student } from '@/types/attendance';
import { formatTimePHT } from '@/lib/time';

interface ScannerStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateScan: (barcode: string) => void;
  onOpenManualModal?: () => void;
  lastScannedBarcode: string | null;
  lastScannedTime: Date | null;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  diagnostics?: {
    lastBurstIntervalAvgMs: number | null;
    lastBurstCharCount: number;
    detectedAsHardware: boolean;
  };
}

export function ScannerStationModal({
  isOpen,
  onClose,
  onSimulateScan,
  onOpenManualModal,
  lastScannedBarcode,
  lastScannedTime,
  audioEnabled,
  onToggleAudio,
  diagnostics,
}: ScannerStationModalProps) {
  const [manualInput, setManualInput] = useState('');

  if (!isOpen) return null;

  const matchedStudent: Student | undefined = INITIAL_STUDENTS.find(
    (s) => s.barcode === lastScannedBarcode || s.studentNumber.toLowerCase() === lastScannedBarcode?.toLowerCase()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onSimulateScan(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Barcode & HID Scanner Station"
      description="Hardware listener active for USB/Bluetooth HID wedges & manual simulation. Press F9 anywhere to toggle."
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Info size={14} className="text-slate-400" />
            <span>Shortcut: <kbd className="font-mono bg-slate-200 px-1 py-0.5 rounded text-[11px] text-slate-700">F9</kbd> toggles this station</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md text-xs font-semibold transition-colors"
          >
            Close Station
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Hardware Diagnostics Banner (Honest Scanner State D5) */}
        <div className="p-3.5 rounded-md bg-[#F0F4F9] border border-[#CBD5E1] flex items-start gap-3 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 status-indicator-live mt-1 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0A1C33]">
                Listening for Barcode Scanner Input
              </span>
              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                Max Interval &lt; 50ms / Enter Terminator
              </span>
            </div>
            <p className="text-slate-600 mt-1">
              Standard USB and Bluetooth HID scanners send keystroke bursts followed by Enter. Keystrokes are captured anywhere on this screen.
            </p>

            {diagnostics && diagnostics.lastBurstIntervalAvgMs !== null && (
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-4 text-[11px] text-slate-700">
                <span className="flex items-center gap-1">
                  <Activity size={13} className="text-[#0E294B]" />
                  Keystroke Burst Speed:{' '}
                  <strong className="font-mono text-[#0A1C33]">
                    {diagnostics.lastBurstIntervalAvgMs} ms/char
                  </strong>
                </span>
                <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-white border border-slate-300">
                  {diagnostics.detectedAsHardware
                    ? '✓ Hardware Scanner Burst Verified'
                    : 'Manual / Simulated Typing'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Manual Barcode Input Target */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <label
            htmlFor="scanner-station-input"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Manual Barcode Entry / Targeted Reader
          </label>
          <div className="flex gap-2">
            <input
              id="scanner-station-input"
              type="text"
              data-scanner-input="true"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Scan or type barcode (e.g. 20240198001 or JBLCF-2024-0198)"
              className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E294B] focus:border-[#0E294B]"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#0E294B] hover:bg-[#143765] text-white text-xs font-semibold rounded-md transition-colors shrink-0"
            >
              Log Scan
            </button>
          </div>
        </form>

        {/* Quick Simulation Buttons */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Simulate ID Badge Swipes (Sample Cadets)
            </span>
            <span className="text-[11px] text-slate-500">
              Click to trigger instant scan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INITIAL_STUDENTS.slice(0, 4).map((student) => (
              <button
                key={student.id}
                type="button"
                onClick={() => onSimulateScan(student.barcode)}
                className="p-2.5 rounded-md border border-slate-200 hover:border-[#0E294B] hover:bg-slate-50 text-left text-xs transition-colors flex items-center justify-between group"
              >
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 group-hover:text-[#0E294B] block truncate">
                    {student.fullName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {student.studentNumber} • {student.yearSection}
                  </span>
                </div>
                <Zap size={14} className="text-amber-500 group-hover:text-[#C99313] shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Last Scanned Result Card */}
        {lastScannedBarcode && (
          <div className="p-4 rounded-md border-2 border-[#166534] bg-emerald-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-700" />
                Last Scan Evaluation
              </span>
              <span className="font-mono text-xs text-emerald-800">
                {lastScannedTime ? formatTimePHT(lastScannedTime) : ''}
              </span>
            </div>

            {matchedStudent ? (
              <div className="bg-white p-3 rounded border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {matchedStudent.fullName}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    {matchedStudent.course} • <strong>{matchedStudent.yearSection}</strong>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 mt-1">
                    Barcode: {matchedStudent.barcode} | ID: {matchedStudent.studentNumber}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-xs uppercase border border-emerald-300 shrink-0">
                  Matched Cadet
                </span>
              </div>
            ) : (
              <div className="bg-white p-3 rounded border border-red-200 text-xs flex flex-col gap-2">
                <div className="flex items-center gap-2 text-red-700 font-bold">
                  <AlertTriangle size={15} />
                  <span>Unrecognized Barcode: {lastScannedBarcode}</span>
                </div>
                <p className="text-slate-600 text-xs">
                  This code does not match any enrolled student. No attendance record was generated.
                </p>
                {onOpenManualModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenManualModal();
                    }}
                    className="self-start inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#0E294B] text-white text-xs font-semibold hover:bg-[#143765]"
                  >
                    <UserCheck size={14} className="text-[#DEB033]" />
                    <span>Look up student manually</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Audio Toggle & Manual Fallback Link */}
        <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleAudio}
              className="flex items-center gap-1 text-[#0E294B] font-semibold hover:underline"
            >
              {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span>{audioEnabled ? 'Scanner Audio: Active' : 'Scanner Audio: Muted'}</span>
            </button>
          </div>

          {onOpenManualModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenManualModal();
              }}
              className="text-[#0E294B] font-semibold hover:underline flex items-center gap-1"
            >
              <UserCheck size={14} className="text-[#C99313]" />
              <span>Barcode damaged or missing? Record manually</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
