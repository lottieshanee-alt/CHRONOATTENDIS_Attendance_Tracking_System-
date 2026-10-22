'use client';

import React from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
} from 'lucide-react';
import { DailyMetrics } from '@/types/attendance';
import { cn } from '@/lib/utils';

interface MetricsBarProps {
  metrics: DailyMetrics;
  selectedPeriod: 'today' | 'previous';
  onSelectPeriod: (period: 'today' | 'previous') => void;
  previousDayMetrics: DailyMetrics;
}

export function MetricsBar({
  metrics,
  selectedPeriod,
  onSelectPeriod,
  previousDayMetrics,
}: MetricsBarProps) {
  const isToday = selectedPeriod === 'today';

  // Calculate comparative delta against previous day
  const deltaPresent = metrics.presentCount - previousDayMetrics.presentCount;
  const deltaPercent = (metrics.presentPercentage - previousDayMetrics.presentPercentage).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Institutional Tab Switching & Period Information */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#0E294B]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Attendance Cycle:
          </span>
          <span className="text-xs font-bold text-[#0A1C33]">
            {metrics.displayDate}
          </span>
          {isToday && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-indicator-live" />
              Real-Time Polling
            </span>
          )}
        </div>

        {/* Institutional Tabs */}
        <div className="inline-flex rounded-md p-1 bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => onSelectPeriod('today')}
            className={cn(
              'px-4 py-1.5 text-xs font-semibold rounded transition-all',
              isToday
                ? 'bg-[#0E294B] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Today&apos;s Attendance
          </button>
          <button
            type="button"
            onClick={() => onSelectPeriod('previous')}
            className={cn(
              'px-4 py-1.5 text-xs font-semibold rounded transition-all',
              !isToday
                ? 'bg-[#0E294B] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Previous Day&apos;s Attendance
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid (Strict 8pt Grid: 5 Equal Institutional Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Enrolled */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Enrolled
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-[#0A1C33] tracking-tight">
              {metrics.totalEnrolled.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active Cadets & Students
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Roster Baseline</span>
            <span className="font-semibold text-slate-700 font-mono">100%</span>
          </div>
        </div>

        {/* Metric 2: Present Count & Percentage */}
        <div className="bg-white rounded-lg border-2 border-[#166534] p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {isToday ? 'Present Today' : 'Present (Prev Day)'}
            </span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#166534]">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#166534] tracking-tight">
                {metrics.presentCount.toLocaleString()}
              </span>
              <span className="text-sm font-bold font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                {metrics.presentPercentage}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Confirmed Station Check-ins
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Turnout Rate</span>
            {isToday ? (
              <span className="font-semibold text-emerald-700 font-mono flex items-center gap-0.5">
                <ArrowUpRight size={12} />
                +{deltaPercent}% vs Y-Day
              </span>
            ) : (
              <span className="font-semibold text-slate-700 font-mono">
                Historical Record
              </span>
            )}
          </div>
        </div>

        {/* Metric 3: Boys Attendance (Male Cadets) */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Boys Attendance
            </span>
            <div className="w-8 h-8 rounded-md bg-[#E3ECF7] border border-[#CBD5E1] flex items-center justify-center text-[#0E294B]">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#0A1C33] tracking-tight">
                {metrics.boysPresent.toLocaleString()}
              </span>
              <span className="text-xs font-bold font-mono text-[#0E294B] bg-slate-100 px-1.5 py-0.5 rounded">
                {metrics.boysPercentage}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Out of {metrics.boysTotal.toLocaleString()} Male Cadets
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Maritime Regt. Turnout</span>
            <span className="font-semibold text-[#0E294B] font-mono">
              {metrics.boysPercentage}%
            </span>
          </div>
        </div>

        {/* Metric 4: Girls Attendance (Female Students) */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Girls Attendance
            </span>
            <div className="w-8 h-8 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C99313]">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#0A1C33] tracking-tight">
                {metrics.girlsPresent.toLocaleString()}
              </span>
              <span className="text-xs font-bold font-mono text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                {metrics.girlsPercentage}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Out of {metrics.girlsTotal.toLocaleString()} Female Students
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Academic Division Turnout</span>
            <span className="font-semibold text-amber-800 font-mono">
              {metrics.girlsPercentage}%
            </span>
          </div>
        </div>

        {/* Metric 5: Total Absences */}
        <div className="bg-white rounded-lg border border-red-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Absences
            </span>
            <div className="w-8 h-8 rounded-md bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
              <UserX size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-red-700 tracking-tight">
                {metrics.totalAbsences}
              </span>
              <span className="text-xs font-medium text-slate-500">
                ({((metrics.totalAbsences / metrics.totalEnrolled) * 100).toFixed(1)}%)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {metrics.absentUnexcused} Unexcused • {metrics.absentExcused} Excused
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1 text-amber-700 font-medium">
              <Clock3 size={12} />
              {metrics.lateArrivals} Late Arrivals
            </span>
            <span className="font-semibold text-red-700 font-mono">
              Alerts Flagged
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
