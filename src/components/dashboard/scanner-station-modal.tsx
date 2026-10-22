'use client';

import React, { useState } from 'react';
import {
  X,
  Scan,
  Volume2,
  VolumeX,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Info,
  Clock,
  User,
} from 'lucide-react';
import { INITIAL_STUDENTS } from '@/lib/mock-data';
import { Student } from '@/types/attendance';
import { cn } from '@/lib/utils';

interface ScannerStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateScan: (barcode: string) => void;
  lastScannedBarcode: string | null;
  lastScannedTime: Date | null;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export function ScannerStationModal({
  isOpen,
  onClose,
  onSimulateScan,
  lastScannedBarcode,
  lastScannedTime,
  audioEnabled,
  onToggleAudio,
}: ScannerStationModalProps) {
  const [manualInput, setManualInput] = useState('');
  const [selectedGate, setSelectedGate] = useState('Gate 1 - Main Turnstile');

  if (!isOpen) return null;

  const matchedStudent: Student | undefined = INITIAL_STUDENTS.find(
    (s) => s.barcode === lastScannedBarcode || s.studentNumber === lastScannedBarcode
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onSimulateScan(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0A1C33] text-white p-4 flex items-center justify-between border-b border-[#143765]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#0E294B] border border-[#C99313] flex items-center justify-center text-[#DEB033]">
              <Scan size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Barcode & HID Scanner Station
              </h2>
              <p className="text-xs text-slate-300">
                Hardware listener active for USB/Bluetooth HID wedges & manual simulation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#143765] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Hardware Diagnostic Banner */}
          <div className="p-3.5 rounded-md bg-[#F0F4F9] border border-[#CBD5E1] flex items-start gap-3 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 status-indicator-live mt-1 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0A1C33]">
                  HID Keyboard Wedge Listener Armed
                </span>
                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                  Buffer &lt; 50ms / Enter Terminator
                </span>
              </div>
              <p className="text-slate-600 mt-1">
                Any connected USB or Bluetooth handheld scanner pointing at an ID card barcode will automatically register attendance instantaneously from anywhere on this screen.
              </p>
            </div>
          </div>

          {/* Manual Input / Physical Scanner Focus Input */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Manual Barcode Entry / Targeted Reader
            </label>
            <div className="flex gap-2">
              <input
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
                Log Attendance
              </button>
            </div>
          </form>

          {/* Quick Simulation Buttons for Testing Without Physical Scanner */}
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
            <div className="p-4 rounded-md border-2 border-emerald-500 bg-emerald-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-700" />
                  Last Verified Scan Result
                </span>
                <span className="font-mono text-xs text-emerald-800">
                  {lastScannedTime?.toLocaleTimeString()}
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
                    Verified Present
                  </span>
                </div>
              ) : (
                <div className="bg-white p-3 rounded border border-amber-300 text-xs">
                  <span className="font-mono font-bold text-slate-800">
                    Barcode {lastScannedBarcode}
                  </span>
                  <p className="text-slate-600 mt-1">
                    Student record logged under temporary visitor/unlisted badge protocol.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sound settings */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Info size={14} className="text-slate-400" />
              Synthesizer provides institutional chime for confirmed scans
            </span>
            <button
              type="button"
              onClick={onToggleAudio}
              className="flex items-center gap-1 text-[#0E294B] font-semibold hover:underline"
            >
              {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span>{audioEnabled ? 'Sound On' : 'Muted'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md text-xs font-semibold transition-colors"
          >
            Close Station
          </button>
        </div>
      </div>
    </div>
  );
}
