import React from 'react';
import {
  Lock,
  CheckCircle2,
  Clock,
  Users,
  UserCheck,
  UserX,
  Clock3,
  ScanLine,
} from 'lucide-react';
import { BrandMark } from '@/components/brand/brand-mark';

export function DashboardPreview() {
  return (
    <div
      className="relative w-full rounded-[20px] border border-slate-200/90 bg-white shadow-floating overflow-hidden select-none pointer-events-none"
      aria-hidden="true"
    >
      {/* Browser Window Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/90 border-b border-slate-200">
        {/* macOS / Window traffic lights */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
        </div>

        {/* URL Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-white border border-slate-200 text-[11px] font-mono text-slate-500 max-w-[280px] truncate">
          <Lock size={10} className="text-[#976b08] shrink-0" />
          <span className="truncate">chronoattendis.jblcf.edu.ph/dashboard</span>
        </div>

        {/* Sample Data Badge */}
        <div className="flex items-center">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-[#f1f6fc] text-[#0e294b] border border-[#143765]/20 text-[11px] font-semibold tracking-wide uppercase">
            Sample data
          </span>
        </div>
      </div>

      {/* Mock System Bar */}
      <div className="px-5 py-3.5 bg-[#0a1c33] text-white flex items-center justify-between border-b border-[#143765]">
        <div className="flex items-center gap-2.5">
          <BrandMark size="sm" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-tight text-white">
              ChronoAttendis Operational Deck
            </span>
            <span className="text-[10px] text-[#deb033] uppercase tracking-wider">
              JBLCF-Bacolod Maritime Muster
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 status-indicator-live" />
          <span className="text-[11px] font-medium text-emerald-300 tracking-wide">
            Live Muster Active
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="p-4 sm:p-5 bg-slate-50/60 border-b border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-[12px] border border-slate-200 shadow-raised">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Roster</span>
              <Users size={14} className="text-[#1b4780]" />
            </div>
            <div className="text-xl font-bold text-[#0a1c33] tabular-nums">412</div>
            <span className="text-[10px] text-slate-500">Enrolled cadets</span>
          </div>

          <div className="bg-white p-3 rounded-[12px] border border-slate-200 shadow-raised">
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Present</span>
              <UserCheck size={14} className="text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-emerald-700 tabular-nums">388</div>
            <span className="text-[10px] font-medium text-emerald-600">94.2% on station</span>
          </div>

          <div className="bg-white p-3 rounded-[12px] border border-slate-200 shadow-raised">
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Late</span>
              <Clock3 size={14} className="text-amber-600" />
            </div>
            <div className="text-xl font-bold text-amber-700 tabular-nums">16</div>
            <span className="text-[10px] text-amber-700">Flagged arrival</span>
          </div>

          <div className="bg-white p-3 rounded-[12px] border border-slate-200 shadow-raised">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Absent</span>
              <UserX size={14} className="text-rose-600" />
            </div>
            <div className="text-xl font-bold text-[#0a1c33] tabular-nums">8</div>
            <span className="text-[10px] text-slate-500">Unaccounted</span>
          </div>
        </div>
      </div>

      {/* Live Scan Log Stream Preview */}
      <div className="p-4 sm:p-5 bg-white space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <ScanLine size={14} className="text-[#976b08]" />
            <span className="text-xs font-semibold text-[#0a1c33]">
              Recent Terminal Scans
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono tabular-nums">
            Port Terminal #01
          </span>
        </div>

        <div className="space-y-2">
          {/* Item 1 */}
          <div className="flex items-center justify-between p-2.5 rounded-[8px] bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#0e294b]/10 text-[#0e294b] font-bold text-xs flex items-center justify-center shrink-0">
                JD
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#0a1c33]">
                  Midshipman J. Dela Cruz
                </span>
                <span className="text-[11px] text-slate-500">
                  BS Marine Transportation • Sec 2A
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tabular-nums text-slate-500">07:42 AM</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                <CheckCircle2 size={12} className="text-emerald-600" />
                Present
              </span>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center justify-between p-2.5 rounded-[8px] bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#0e294b]/10 text-[#0e294b] font-bold text-xs flex items-center justify-center shrink-0">
                ET
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#0a1c33]">
                  Midshipman E. M. Tan
                </span>
                <span className="text-[11px] text-slate-500">
                  BS Marine Engineering • Sec 1B
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tabular-nums text-slate-500">07:45 AM</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                <CheckCircle2 size={12} className="text-emerald-600" />
                Present
              </span>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-center justify-between p-2.5 rounded-[8px] bg-amber-50/40 border border-amber-200/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                RS
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#0a1c33]">
                  Midshipman R. A. Santos
                </span>
                <span className="text-[11px] text-slate-500">
                  BS Marine Transportation • Sec 3A
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tabular-nums text-slate-500">07:51 AM</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                <Clock size={12} className="text-amber-700" />
                Late
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
