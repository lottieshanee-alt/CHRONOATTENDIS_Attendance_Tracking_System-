'use client';

import React, { useState } from 'react';
import { CLASS_ATTENDANCE_STATS } from '@/lib/mock-data';
import { ClassAttendanceStat } from '@/types/attendance';
import { Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ClassDistributionChart() {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [hoveredClass, setHoveredClass] = useState<ClassAttendanceStat | null>(null);

  const departments = ['all', 'Maritime Education', 'Business & Hospitality', 'Customs Administration', 'Senior High School'];

  const filteredData = selectedDept === 'all'
    ? CLASS_ATTENDANCE_STATS
    : CLASS_ATTENDANCE_STATS.filter((c) => c.department === selectedDept);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A1C33]">
              Attendance by Class & Academic Section
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E3ECF7] text-[#0E294B] border border-[#CBD5E1]">
              Headcount Roster
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time section turnout comparing present vs total enrolled strength
          </p>
        </div>

        {/* Department Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              className={cn(
                'px-2.5 py-1 text-xs rounded font-medium transition-colors',
                selectedDept === dept
                  ? 'bg-[#0E294B] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {dept === 'all' ? 'All Sections' : dept.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="my-4 space-y-3.5">
        {filteredData.map((stat) => {
          const isHighTurnout = stat.attendanceRate >= 95;

          return (
            <div
              key={stat.section}
              onMouseEnter={() => setHoveredClass(stat)}
              onMouseLeave={() => setHoveredClass(null)}
              className="group cursor-pointer p-2 rounded-md hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0A1C33] group-hover:text-[#0E294B]">
                    {stat.section}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    ({stat.department})
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-600">
                    <strong className="text-slate-900">{stat.present}</strong> / {stat.totalStudents} Cadets
                  </span>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[11px] font-bold',
                      isHighTurnout
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    )}
                  >
                    {stat.attendanceRate}%
                  </span>
                </div>
              </div>

              {/* Progress Stack Bar */}
              <div className="w-full h-3 bg-slate-100 rounded-sm overflow-hidden flex border border-slate-200">
                {/* Present Bar (Institutional Deep Blue) */}
                <div
                  className="h-full bg-[#0E294B] transition-all duration-500"
                  style={{
                    width: `${(stat.present / stat.totalStudents) * 100}%`,
                  }}
                  title={`Present: ${stat.present}`}
                />
                {/* Late Bar (Academic Gold) */}
                {stat.late > 0 && (
                  <div
                    className="h-full bg-[#C99313] transition-all duration-500"
                    style={{
                      width: `${(stat.late / stat.totalStudents) * 100}%`,
                    }}
                    title={`Late: ${stat.late}`}
                  />
                )}
                {/* Absent Bar (Crimson) */}
                {stat.absent > 0 && (
                  <div
                    className="h-full bg-red-600 transition-all duration-500"
                    style={{
                      width: `${(stat.absent / stat.totalStudents) * 100}%`,
                    }}
                    title={`Absent: ${stat.absent}`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Footer with breakdown legend */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#0E294B] rounded-xs" />
            <span>Present On-Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#C99313] rounded-xs" />
            <span>Late Check-in</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-600 rounded-xs" />
            <span>Unexcused Absent</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Average College Turnout: <strong>95.3%</strong>
        </div>
      </div>
    </div>
  );
}
