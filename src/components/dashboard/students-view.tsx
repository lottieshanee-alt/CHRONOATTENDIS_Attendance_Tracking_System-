'use client';

import React, { useState } from 'react';
import { INITIAL_STUDENTS } from '@/lib/mock-data';
import { Student } from '@/types/attendance';
import {
  GraduationCap,
  Search,
  QrCode,
  Phone,
  ShieldCheck,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentsViewProps {
  onSimulateScan: (barcode: string) => void;
}

export function StudentsView({ onSimulateScan }: StudentsViewProps) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const filteredStudents = INITIAL_STUDENTS.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(search.toLowerCase()) ||
      student.studentNumber.toLowerCase().includes(search.toLowerCase()) ||
      student.barcode.includes(search) ||
      student.yearSection.toLowerCase().includes(search.toLowerCase());

    const matchesDept =
      selectedDept === 'all' || student.department.includes(selectedDept);

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#0A1C33]">
            Student & Cadet Enrollment Directory
          </h2>
          <p className="text-xs text-slate-500">
            Registered biometric RFID and Barcode credentials for JBLCF-Bacolod
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ID, or barcode..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B] focus:border-[#0E294B]"
            />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto">
            {['all', 'Maritime', 'Business', 'Senior High'].map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={cn(
                  'px-3 py-1.5 rounded text-xs font-semibold capitalize transition-colors',
                  selectedDept === dept
                    ? 'bg-[#0E294B] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {dept === 'all' ? 'All' : dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-3 hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-md flex items-center justify-center font-bold text-xs shrink-0 border',
                      student.gender === 'male'
                        ? 'bg-[#0E294B] text-white border-[#143765]'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    )}
                  >
                    {student.fullName
                      .split(' ')
                      .filter((n) => !n.startsWith('Cadet'))
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>

                  <div>
                    <h3 className="font-bold text-xs text-[#0A1C33] leading-snug">
                      {student.fullName}
                    </h3>
                    <p className="text-[11px] font-semibold text-[#0E294B] mt-0.5">
                      {student.yearSection}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                  {student.studentNumber}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="text-[11px] text-slate-500 truncate">
                  {student.department}
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] pt-1">
                  <span className="text-slate-400">Barcode Payload:</span>
                  <span className="font-bold text-slate-800">{student.barcode}</span>
                </div>
                {student.emergencyContact && (
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                    <Phone size={11} className="text-slate-400" />
                    <span>Emergency: {student.emergencyContact}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onSimulateScan(student.barcode)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-slate-100 hover:bg-[#0E294B] hover:text-white text-slate-700 text-xs font-semibold transition-colors group"
              >
                <Zap size={13} className="text-amber-500 group-hover:text-amber-300" />
                <span>Simulate Turnstile Scan</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
