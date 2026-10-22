'use client';

import React from 'react';
import { BellRing, FileText, Calendar, AlertCircle, Shield } from 'lucide-react';

interface Circular {
  id: string;
  memoNumber: string;
  title: string;
  date: string;
  category: 'Regimental Order' | 'Academic Advisory' | 'Administrative Memo';
  author: string;
  summary: string;
  isUrgent?: boolean;
}

const CIRCULARS: Circular[] = [
  {
    id: 'memo-01',
    memoNumber: 'MEMO-VPAA-2026-088',
    title: 'Mandatory ID Barcode Badge Scanning at All Campus Access Gates',
    date: 'October 21, 2026',
    category: 'Administrative Memo',
    author: 'Office of the Vice President for Academic Affairs',
    summary:
      'All Midshipmen, Deck/Engine Cadets, Senior High School students, and Faculty are strictly reminded that physical RFID/Barcode identification must be presented at Turnstiles 1, 2, and 3 upon entering the campus. Tardy registrations past 07:45 AM will automatically be flagged for demerit review under Naval Science protocol.',
    isUrgent: true,
  },
  {
    id: 'memo-02',
    memoNumber: 'REG-ORD-2026-114',
    title: 'Midterm Regimental Color Inspection & Parade Uniform Standards',
    date: 'October 19, 2026',
    category: 'Regimental Order',
    author: 'Commandant of Cadets / Dept of Naval Science',
    summary:
      'The Commandant announces full dress uniform inspection scheduled for Thursday, October 22, 2026, commencing promptly at 07:15 AM at the Main Maritime Quadrangle. Headcount logs will be extracted directly from ChronoAttendis at 07:30 AM muster call.',
    isUrgent: false,
  },
  {
    id: 'memo-03',
    memoNumber: 'ACAD-ADV-2026-042',
    title: 'Bridge Simulator Practical Examination Schedule (Batch Alpha & Bravo)',
    date: 'October 18, 2026',
    category: 'Academic Advisory',
    author: 'College of Maritime Education - Navigation Division',
    summary:
      'Batch assignments for IMO-standard Radar Watchkeeping assessments have been finalized. Cadets are required to scan in at Simulator Complex Room 302 at least 15 minutes prior to scheduled watch time.',
    isUrgent: false,
  },
];

export function NoticeBoardView() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#0A1C33]">
            Institutional Notice Board & Circulars
          </h2>
          <p className="text-xs text-slate-500">
            Official announcements from the Board of Trustees, Dean&apos;s Office, and Regimental Command
          </p>
        </div>
        <span className="px-3 py-1 rounded bg-[#E3ECF7] text-[#0E294B] text-xs font-semibold border border-[#CBD5E1]">
          Official Dispatches
        </span>
      </div>

      {/* Circulars List */}
      <div className="space-y-4">
        {CIRCULARS.map((circular) => (
          <div
            key={circular.id}
            className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3 hover:border-slate-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    circular.isUrgent
                      ? 'bg-red-100 text-red-900 border border-red-300'
                      : 'bg-[#E3ECF7] text-[#0E294B] border border-[#CBD5E1]'
                  }`}
                >
                  {circular.category}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-500">
                  {circular.memoNumber}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <Calendar size={13} className="text-slate-400" />
                <span>{circular.date}</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-[#0A1C33] leading-snug">
                {circular.title}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {circular.summary}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-700">
                Signatory: {circular.author}
              </span>
              <span className="text-[11px] font-mono text-[#0E294B] font-semibold">
                JBLCF-Bacolod Verified
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
