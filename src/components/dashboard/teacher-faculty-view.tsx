'use client';

import React, { useState } from 'react';
import {
  Award,
  Mail,
  Building,
  Clock,
  Search,
  Plus,
  Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';

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

const INITIAL_FACULTY: FacultyMember[] = [
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
    department: 'College of Maritime Education',
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
    department: 'Senior High School',
    assignedDuty: 'Bridge Laboratory 2 Proctor',
    dutyTime: '09:00 AM - 03:00 PM',
    status: 'On Duty',
    contact: '+63 928 567 8901',
    email: 'm.gonzaga@jblcf-bacolod.edu.ph',
  },
];

export function TeacherFacultyView() {
  const [faculty, setFaculty] = useState<FacultyMember[]>(INITIAL_FACULTY);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formRank, setFormRank] = useState('Instructor');
  const [formDept, setFormDept] = useState('College of Maritime Education');
  const [formDuty, setFormDuty] = useState('Turnstile Gate HID Verification');
  const [formDutyTime, setFormDutyTime] = useState('07:00 AM - 12:00 PM');
  const [formStatus, setFormStatus] = useState<'On Duty' | 'In Class' | 'Off Duty'>('On Duty');
  const [formContact, setFormContact] = useState('+63 917 000 0000');
  const [formEmail, setFormEmail] = useState('');

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.rank.toLowerCase().includes(search.toLowerCase()) ||
      f.assignedDuty.toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase());

    const matchesDept =
      selectedDept === 'all' || f.department.includes(selectedDept);

    return matchesSearch && matchesDept;
  });

  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newFaculty: FacultyMember = {
      id: `fac-${Date.now()}`,
      name: formName.trim(),
      rank: formRank,
      department: formDept,
      assignedDuty: formDuty,
      dutyTime: formDutyTime,
      status: formStatus,
      contact: formContact,
      email: formEmail.trim() || `${formName.toLowerCase().replace(/[^a-z]/g, '')}@jblcf-bacolod.edu.ph`,
    };

    setFaculty([newFaculty, ...faculty]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#0A1C33]">
            Faculty &amp; Departmental Officer Roster
          </h2>
          <p className="text-xs text-slate-500">
            Attendance monitoring officers and instructors on active campus watch
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
              placeholder="Search faculty name or duty..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B] focus:border-[#0E294B]"
            />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto">
            {['all', 'Maritime', 'Business', 'Naval', 'Senior High'].map((dept) => (
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

          <button
            type="button"
            onClick={() => {
              setFormName('');
              setFormEmail('');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0E294B] hover:bg-[#143765] text-white text-xs font-bold rounded-md shadow-sm transition-colors shrink-0"
          >
            <Plus size={14} />
            <span>Add Officer</span>
          </button>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFaculty.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-3 hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-[#0E294B] text-white border border-[#143765] flex items-center justify-center font-bold text-xs shrink-0">
                    {member.name
                      .split(' ')
                      .filter((n) => !['Capt.', 'Chief', 'Engr.', '2/O', 'Prof.', 'Instr.'].includes(n))
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')}
                  </div>

                  <div className="min-w-0">
                    <span className="font-bold text-sm text-[#0A1C33] truncate block">
                      {member.name}
                    </span>
                    <span className="text-xs text-slate-500 font-medium truncate block">
                      {member.rank}
                    </span>
                  </div>
                </div>

                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0',
                    member.status === 'On Duty'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : member.status === 'In Class'
                      ? 'bg-[#E3ECF7] text-[#0E294B] border border-[#CBD5E1]'
                      : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {member.status}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <Building size={13} className="text-[#0E294B] shrink-0 mt-0.5" />
                  <span className="text-slate-600">{member.department}</span>
                </div>

                <div className="flex items-start gap-2">
                  <Award size={13} className="text-[#C99313] shrink-0 mt-0.5" />
                  <span className="text-slate-800 font-semibold">{member.assignedDuty}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-slate-400 shrink-0" />
                  <span className="text-slate-500 font-mono text-[11px]">{member.dutyTime}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Phone size={10} className="text-slate-400" />
                {member.contact}
              </span>
              <span className="flex items-center gap-1">
                <Mail size={10} className="text-slate-400" />
                {member.email.split('@')[0]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Faculty Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Assign Monitoring Faculty / Officer"
          maxWidth="md"
        >
          <form onSubmit={handleAddFaculty} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Officer Name &amp; Title
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. 3/O Carlos V. Garcia"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rank / Designation
                </label>
                <input
                  type="text"
                  required
                  value={formRank}
                  onChange={(e) => setFormRank(e.target.value)}
                  placeholder="e.g. Maritime Instructor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
                >
                  <option value="College of Maritime Education">Maritime Education</option>
                  <option value="Naval Science & Tactics">Naval Science</option>
                  <option value="College of Business & Education">Business &amp; Education</option>
                  <option value="Senior High School">Senior High School</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Attendance Duty
                </label>
                <input
                  type="text"
                  required
                  value={formDuty}
                  onChange={(e) => setFormDuty(e.target.value)}
                  placeholder="e.g. Main Gate Inspection"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Duty Hours
                </label>
                <input
                  type="text"
                  required
                  value={formDutyTime}
                  onChange={(e) => setFormDutyTime(e.target.value)}
                  placeholder="07:00 AM - 12:00 PM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  placeholder="+63 917 000 0000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'On Duty' | 'In Class' | 'Off Duty')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
                >
                  <option value="On Duty">On Duty</option>
                  <option value="In Class">In Class</option>
                  <option value="Off Duty">Off Duty</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0E294B] hover:bg-[#143765] text-white rounded-md font-bold shadow-xs"
              >
                Assign Officer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
