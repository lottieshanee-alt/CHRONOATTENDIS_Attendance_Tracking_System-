'use client';

import React from 'react';
import {
  UserCheck,
  Award,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface FacultyMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  assignedDuty: string;
  dutyTime: string;
  status: 'On Duty' | 'In Class' | 'Off Duty';
  contact: string;
  email: string;
}

const FACULTY_LIST: FacultyMember[] = [
  {
    id: 'fac-01',
    name: 'Capt. Roberto M. Sian',
    rank: 'Master Mariner / Dean',
    department: 'College of Maritime Education',
    assignedDuty: 'Parade Ground & Color Inspection',
    dutyTime: '07:00 AM - 12:00 PM',
    status: 'On Duty',
    contact: '+63 917 123 4567',
    email: 'r.sian@jblcf-bacolod.edu.ph',
  },
  {
    id: 'fac-02',
    name: 'Chief Engr. Danilo Reyes',
    rank: 'Chief Marine Engineer',
    department: 'College of Maritime Education (BSMarE)',
    assignedDuty: 'Engine Simulator Practical Watch',
    dutyTime: '08:00 AM - 04:00 PM',
    status: 'In Class',
    contact: '+63 918 234 5678',
    email: 'd.reyes@jblcf-bacolod.edu.ph',
  },
  {
    id: 'fac-03',
    name: '2/O Ramon S. Villanueva',
    rank: 'Regimental Officer / Instructor',
    department: 'Naval Science & Tactics',
    assignedDuty: 'Turnstile Gate 1 & 2 HID Verification',
    dutyTime: '06:30 AM - 11:30 AM',
    status: 'On Duty',
    contact: '+63 920 345 6789',
    email: 'r.villanueva@jblcf-bacolod.edu.ph',
  },
  {
    id: 'fac-04',
    name: 'Prof. Carmela D. Alunan',
    rank: 'Associate Professor / Dept. Chair',
    department: 'College of Business & Education',
    assignedDuty: 'Academic Wing Attendance Audit',
    dutyTime: '08:30 AM - 05:00 PM',
    status: 'In Class',
    contact: '+63 922 456 7890',
    email: 'c.alunan@jblcf-bacolod.edu.ph',
  },
  {
    id: 'fac-05',
    name: 'Instr. Mark Anthony Gonzaga',
    rank: 'Maritime Instructor',
    department: 'Senior High School Maritime',
    assignedDuty: 'Bridge Laboratory 2 Proctor',
    dutyTime: '09:00 AM - 03:00 PM',
    status: 'On Duty',
    contact: '+63 928 567 8901',
    email: 'm.gonzaga@jblcf-bacolod.edu.ph',
  },
];

export function TeacherFacultyView() {
  return (
    <div className="space-y-5">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#0A1C33]">
            Faculty & Departmental Officer Roster
          </h2>
          <p className="text-xs text-slate-500">
            Attendance monitoring officers and instructors on active campus watch
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-[#E3ECF7] text-[#0E294B] text-xs font-semibold border border-[#CBD5E1]">
            18 Assigned Faculty Today
          </span>
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FACULTY_LIST.map((fac) => (
          <div
            key={fac.id}
            className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-md bg-[#0E294B] text-[#DEB033] font-bold text-sm flex items-center justify-center border border-[#143765]">
                  {fac.name
                    .split(' ')
                    .filter((n) => !n.startsWith('Capt.') && !n.startsWith('Chief') && !n.startsWith('2/O') && !n.startsWith('Prof.') && !n.startsWith('Instr.'))
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0A1C33]">
                    {fac.name}
                  </h3>
                  <p className="text-xs text-[#976B08] font-medium">
                    {fac.rank}
                  </p>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  fac.status === 'On Duty'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-[#E3ECF7] text-[#0E294B] border border-[#CBD5E1]'
                }`}
              >
                {fac.status}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Building size={14} className="text-slate-400 shrink-0" />
                <span className="truncate">{fac.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={14} className="text-[#C99313] shrink-0" />
                <span className="font-medium text-slate-800">
                  Duty: {fac.assignedDuty}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <Clock size={14} className="text-slate-400 shrink-0" />
                <span>{fac.dutyTime}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <span className="truncate">{fac.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
