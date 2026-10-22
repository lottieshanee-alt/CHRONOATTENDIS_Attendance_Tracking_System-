'use client';

import React from 'react';
import { ACTIVITY_HIGHLIGHTS } from '@/lib/mock-data';
import { ActivityHighlight } from '@/types/attendance';
import { Clock, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ActivityGallery() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A1C33]">
            Institutional Activity Gallery & Regimental Directives
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational verification protocols scheduled for today across maritime and academic facilities
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {ACTIVITY_HIGHLIGHTS.map((act) => {
          const percent = act.enrolledStudentsCount > 0
            ? Math.round((act.verifiedCount / act.enrolledStudentsCount) * 100)
            : 0;
          const isCompleted = act.badge === 'Completed';
          const isInProgress = act.badge === 'In Progress';

          return (
            <div
              key={act.id}
              className="border border-slate-200 rounded-md p-4 bg-slate-50/60 hover:bg-white transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : isInProgress
                        ? 'bg-[#E3ECF7] text-[#0E294B] border border-[#CBD5E1]'
                        : 'bg-slate-200 text-slate-700'
                    )}
                  >
                    {act.badge}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {act.timestamp}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#0A1C33] leading-snug">
                  {act.title}
                </h3>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                  <MapPin size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{act.location}</span>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                  {act.description}
                </p>
              </div>

              {/* Verification Progress */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-slate-500">Verified Attendance</span>
                  <span className="font-bold text-[#0A1C33]">
                    {act.verifiedCount} / {act.enrolledStudentsCount} ({percent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-sm overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-500',
                      isCompleted ? 'bg-emerald-700' : 'bg-[#0E294B]'
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
