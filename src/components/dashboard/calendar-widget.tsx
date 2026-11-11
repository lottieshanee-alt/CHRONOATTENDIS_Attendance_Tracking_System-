'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
} from 'lucide-react';
import { ACADEMIC_EVENTS } from '@/lib/mock-data';
import { getManilaTimeParts } from '@/lib/time';
import { cn } from '@/lib/utils';

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getStartDayOffset(year: number, month: number): number {
  return new Date(year, month, 1).getDay(); // 0 = Sunday
}

function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-PH', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  });
}

export function CalendarWidget() {
  // Real today in Asia/Manila (getManilaTimeParts returns month 1-based)
  const todayParts = useMemo(() => getManilaTimeParts(new Date()), []);
  const todayYear = todayParts.year;
  const todayMonth = todayParts.month - 1; // convert to 0-based for Date API
  const todayDay = todayParts.day;

  const [viewYear, setViewYear] = useState(todayYear);
  const [viewMonth, setViewMonth] = useState(todayMonth);
  const [selectedDay, setSelectedDay] = useState(todayDay);

  const daysInMonth = useMemo(
    () => getDaysInMonth(viewYear, viewMonth),
    [viewYear, viewMonth]
  );
  const startDayOffset = useMemo(
    () => getStartDayOffset(viewYear, viewMonth),
    [viewYear, viewMonth]
  );
  const monthLabel = useMemo(
    () => formatMonthYear(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const isCurrentMonth =
    viewYear === todayYear && viewMonth === todayMonth;

  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDay(1);
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDay(1);
  }

  // MOCK: event markers — only shown when viewing Oct 2026 (month index 9)
  const eventDays: Record<
    number,
    { type: 'drill' | 'ceremony' | 'exam'; label: string }
  > =
    viewYear === 2026 && viewMonth === 9
      ? {
          5: { type: 'ceremony', label: 'Flag Ceremony' },
          12: { type: 'drill', label: 'Safety Drill' },
          19: { type: 'exam', label: 'Prelims Day 1' },
          20: { type: 'exam', label: 'Prelims Day 2' },
          21: { type: 'drill', label: 'Naval Inspection' },
          22: { type: 'ceremony', label: 'Morning Colors' },
          26: { type: 'drill', label: 'Fire Drill' },
        }
      : {};

  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const selectedDayLabel =
    isCurrentMonth && selectedDay === todayDay
      ? 'Today'
      : new Date(viewYear, viewMonth, selectedDay).toLocaleDateString('en-PH', {
          month: 'short',
          day: 'numeric',
        });

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
      {/* Calendar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-[#0E294B]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A1C33]">
            Academic Calendar &amp; Drills
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#0E294B] font-mono">
            {monthLabel}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Names */}
      <div className="grid grid-cols-7 gap-1 text-center my-2 text-[11px] font-semibold text-slate-400 uppercase">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDayOffset }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-8" />
        ))}

        {dayNumbers.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = isCurrentMonth && day === todayDay;
          const event = eventDays[day];

          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              aria-label={`${day}${event ? ` — ${event.label}` : ''}${isToday ? ' (today)' : ''}`}
              className={cn(
                'h-8 rounded relative flex flex-col items-center justify-center text-xs font-mono transition-all',
                isSelected
                  ? 'bg-[#0E294B] text-white font-bold shadow-sm'
                  : isToday
                  ? 'border border-[#C99313] text-[#0A1C33] font-bold bg-[#FFFDF5]'
                  : 'text-slate-700 hover:bg-slate-100'
              )}
            >
              <span>{day}</span>
              {event && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'w-1.5 h-1.5 rounded-full absolute bottom-1',
                    isSelected
                      ? 'bg-[#DEB033]'
                      : event.type === 'ceremony'
                      ? 'bg-[#0E294B]'
                      : event.type === 'drill'
                      ? 'bg-[#C99313]'
                      : 'bg-emerald-600'
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Events */}
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Scheduled Events — {selectedDayLabel}:</span>
          <span className="text-[11px] text-[#0E294B] font-mono">
            {ACADEMIC_EVENTS.length} Scheduled
          </span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {ACADEMIC_EVENTS.map((event) => (
            <div
              key={event.id}
              className="p-2.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-white transition-colors text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0A1C33]">
                  {event.title}
                </span>
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase',
                    event.category === 'Ceremony'
                      ? 'bg-[#E3ECF7] text-[#0E294B]'
                      : event.category === 'Drill'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-900'
                  )}
                >
                  {event.category}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                <span className="flex items-center gap-1 font-mono">
                  <Clock size={11} className="text-slate-400" />
                  {event.time}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={11} className="text-slate-400" />
                  {event.location}
                </span>
              </div>

              <div className="text-[11px] text-slate-600 flex justify-between pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">
                  OIC: {event.officerInCharge}
                </span>
                <span className="font-medium text-[#0E294B]">
                  {event.departmentScope}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
