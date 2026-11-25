'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Play, Clock, BookOpen, Users } from 'lucide-react';

interface OpenSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCutoffTime: string;
  sections: string[];
  onOpenSession: (params: {
    subject: string;
    section: string;
    lateCutoffTime: string;
  }) => Promise<void>;
}

const COMMON_SUBJECTS = [
  'Morning Regimental Muster & Colors',
  'NAV 101 — Terrestrial Navigation 1',
  'SEAM 211 — Cargo Handling & Stowage',
  'ENG 101 — Marine Power Plant',
  'SAFETY 102 — Fire Fighting & Survival at Sea',
  'General Campus Turnstile Gate Attendance',
];

export function OpenSessionModal({
  isOpen,
  onClose,
  defaultCutoffTime,
  sections,
  onOpenSession,
}: OpenSessionModalProps) {
  const [subject, setSubject] = useState(COMMON_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [section, setSection] = useState(sections[0] || 'BSMT 2-Alpha');
  const [lateCutoffTime, setLateCutoffTime] = useState(defaultCutoffTime || '07:45');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const finalSubject = subject === 'Other / Custom Subject' ? customSubject.trim() : subject;
      await onOpenSession({
        subject: finalSubject || 'Attendance Session',
        section,
        lateCutoffTime,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start Taking Attendance"
      description="Create a new official attendance tracking session. All subsequent scans will be logged to this session."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <BookOpen size={14} className="text-[#0E294B]" />
            Subject / Activity Name
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0E294B] text-slate-900"
          >
            {COMMON_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="Other / Custom Subject">Other / Custom Subject...</option>
          </select>
          {subject === 'Other / Custom Subject' && (
            <input
              type="text"
              required
              placeholder="Enter custom subject or muster title"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="mt-2 w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
            />
          )}
        </div>

        {/* Section Target */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Users size={14} className="text-[#0E294B]" />
            Target Section / Cohort
          </label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0E294B] text-slate-900"
          >
            <option value="All Sections">All Sections (Campus-wide / Formation)</option>
            {sections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-500">
            Cadets from other sections will trigger a notification if scanned.
          </p>
        </div>

        {/* Late Cutoff Rule */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Clock size={14} className="text-[#0E294B]" />
            Session Late Cutoff Time (PHT, 24-hr)
          </label>
          <input
            type="time"
            value={lateCutoffTime}
            onChange={(e) => setLateCutoffTime(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0E294B] text-slate-900 font-mono"
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Scans logged after {lateCutoffTime} will be marked Late automatically.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-[#0E294B] hover:bg-[#143765] text-white text-xs font-bold rounded-md shadow-sm transition-colors disabled:opacity-50"
          >
            <Play size={14} className="text-[#DEB033]" />
            {isSubmitting ? 'Opening Session...' : 'Open Session'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
