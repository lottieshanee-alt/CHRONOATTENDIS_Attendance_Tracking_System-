'use client';

import React, { useState } from 'react';
import {
  Search,
  Phone,
  Zap,
  Plus,
  Edit2,
  UserX,
  UserCheck,
  Printer,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Student } from '@/types/attendance';
import { useAttendanceStore } from '@/state/attendance-store';
import { generateCode128Svg } from '@/lib/barcode';
import { Modal } from '@/components/ui/modal';

interface StudentsViewProps {
  onSimulateScan: (barcode: string) => void;
}

export function StudentsView({ onSimulateScan }: StudentsViewProps) {
  const { state, saveStudents } = useAttendanceStore();
  const students = state.students;

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Modal states
  const [barcodeModalStudent, setBarcodeModalStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for Add/Edit
  const [formName, setFormName] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formGender, setFormGender] = useState<'male' | 'female'>('male');
  const [formDept, setFormDept] = useState('College of Maritime Education');
  const [formCourse, setFormCourse] = useState('BS Marine Transportation');
  const [formSection, setFormSection] = useState('BSMT 1-Alpha');
  const [formEmergency, setFormEmergency] = useState('+63 917 000 0000');

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(search.toLowerCase()) ||
      student.studentNumber.toLowerCase().includes(search.toLowerCase()) ||
      student.barcode.includes(search) ||
      student.yearSection.toLowerCase().includes(search.toLowerCase());

    const matchesDept =
      selectedDept === 'all' || student.department.includes(selectedDept);

    return matchesSearch && matchesDept;
  });

  const openAddModal = () => {
    const nextSeq = String(students.length + 1).padStart(3, '0');
    setFormName('');
    setFormNumber(`JBLCF-2026-${nextSeq}`);
    setFormGender('male');
    setFormDept('College of Maritime Education');
    setFormCourse('BS Marine Transportation');
    setFormSection('BSMT 1-Alpha');
    setFormEmergency('+63 917 000 0000');
    setIsAddModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormName(student.fullName);
    setFormNumber(student.studentNumber);
    setFormGender(student.gender);
    setFormDept(student.department);
    setFormCourse(student.course);
    setFormSection(student.yearSection);
    setFormEmergency(student.emergencyContact || '');
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formNumber.trim()) return;

    if (editingStudent) {
      // Edit existing
      const updated = students.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              fullName: formName.trim(),
              studentNumber: formNumber.trim(),
              gender: formGender,
              department: formDept,
              course: formCourse,
              yearSection: formSection,
              emergencyContact: formEmergency.trim(),
            }
          : s
      );
      await saveStudents(updated);
      setEditingStudent(null);
    } else {
      // Create new
      const newBarcode = `2026${Date.now().toString().slice(-7)}`;
      const newStudent: Student = {
        id: `s-${Date.now()}`,
        studentNumber: formNumber.trim(),
        barcode: newBarcode,
        fullName: formName.trim(),
        gender: formGender,
        department: formDept,
        course: formCourse,
        yearSection: formSection,
        emergencyContact: formEmergency.trim(),
        isActive: true,
      };
      await saveStudents([newStudent, ...students]);
      setIsAddModalOpen(false);
    }
  };

  const handleToggleActive = async (student: Student) => {
    const updated = students.map((s) =>
      s.id === student.id ? { ...s, isActive: !s.isActive } : s
    );
    await saveStudents(updated);
  };

  const handleReissueBarcode = async (student: Student) => {
    if (!confirm(`Re-issue new barcode for ${student.fullName}? The previous barcode will be revoked immediately.`)) {
      return;
    }
    const newBarcode = `2026${Date.now().toString().slice(-7)}`;
    const updated = students.map((s) =>
      s.id === student.id
        ? {
            ...s,
            barcode: newBarcode,
            barcodeRevokedAt: new Date().toISOString(),
          }
        : s
    );
    await saveStudents(updated);
    if (barcodeModalStudent?.id === student.id) {
      setBarcodeModalStudent({ ...student, barcode: newBarcode });
    }
  };

  const handlePrintBarcode = (student: Student) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svg = generateCode128Svg(student.barcode, { height: 70, moduleWidth: 2 });
    printWindow.document.write(`
      <html>
        <head>
          <title>Institutional Barcode Badge - ${student.studentNumber}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .badge { border: 2px solid #0A1C33; padding: 24px; border-radius: 8px; text-align: center; width: 340px; }
            .inst { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #976b08; letter-spacing: 0.05em; }
            .title { font-size: 14px; font-weight: bold; color: #0A1C33; margin: 4px 0 16px 0; }
            .name { font-size: 16px; font-weight: bold; color: #0A1C33; margin-top: 14px; }
            .meta { font-size: 12px; color: #475569; margin-top: 4px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="badge">
            <div class="inst">John B. Lacson Colleges Foundation – Bacolod</div>
            <div class="title">OFFICIAL STUDENT BARCODE IDENTIFIER</div>
            <div>${svg}</div>
            <div class="name">${student.fullName}</div>
            <div class="meta">${student.studentNumber} • ${student.yearSection}</div>
            <div class="meta">${student.department}</div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#0A1C33]">
            Student &amp; Cadet Enrollment Directory
          </h2>
          <p className="text-xs text-slate-500">
            Registered Barcode credentials for JBLCF-Bacolod ({students.length} Total Enrolled)
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

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0E294B] hover:bg-[#143765] text-white text-xs font-bold rounded-md shadow-sm transition-colors shrink-0"
          >
            <Plus size={14} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => {
          const isDeactivated = !student.isActive;

          return (
            <div
              key={student.id}
              className={cn(
                'bg-white rounded-lg border p-4 shadow-sm space-y-3 transition-colors flex flex-col justify-between',
                isDeactivated
                  ? 'border-slate-200 bg-slate-50/70 opacity-75'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-md flex items-center justify-center font-bold text-xs shrink-0 border',
                        isDeactivated
                          ? 'bg-slate-200 text-slate-500 border-slate-300'
                          : student.gender === 'male'
                          ? 'bg-[#0E294B] text-white border-[#143765]'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      )}
                    >
                      {student.fullName
                        .split(' ')
                        .filter((n) => !n.startsWith('Cadet'))
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0A1C33] truncate">
                          {student.fullName}
                        </span>
                        {isDeactivated && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-600">
                            INACTIVE
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-slate-400 block">
                        {student.studentNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(student)}
                      aria-label={`Edit ${student.fullName}`}
                      className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                      title="Edit Student Info"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(student)}
                      aria-label={isDeactivated ? `Activate ${student.fullName}` : `Deactivate ${student.fullName}`}
                      className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                      title={isDeactivated ? 'Activate Student' : 'Deactivate Student'}
                    >
                      {isDeactivated ? <UserCheck size={14} className="text-emerald-600" /> : <UserX size={14} className="text-amber-600" />}
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Section</span>
                    <span className="font-semibold text-[#0E294B]">
                      {student.yearSection}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department</span>
                    <span className="text-slate-700 truncate max-w-[180px]">
                      {student.department}
                    </span>
                  </div>
                  {student.emergencyContact && (
                    <div className="flex justify-between items-center pt-0.5">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Phone size={11} className="text-slate-400" />
                        Emergency
                      </span>
                      <span className="font-mono text-slate-600 text-[11px]">
                        {student.emergencyContact}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Barcode & Actions footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setBarcodeModalStudent(student)}
                  className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded transition-colors"
                  title="View and print Code 128 barcode"
                >
                  <QrCode size={13} className="text-[#0E294B]" />
                  <span>{student.barcode}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSimulateScan(student.barcode)}
                  disabled={isDeactivated}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0E294B] hover:bg-[#143765] text-white text-[11px] font-bold shadow-xs transition-colors shrink-0 disabled:opacity-40"
                  title="Simulate Turnstile Barcode Scan"
                >
                  <Zap size={11} className="text-[#DEB033]" />
                  <span>Scan</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barcode Viewer & Print Modal */}
      {barcodeModalStudent && (
        <Modal
          isOpen={true}
          onClose={() => setBarcodeModalStudent(null)}
          title="Institutional Barcode Identifier"
          maxWidth="sm"
        >
          <div className="space-y-4 text-center">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col items-center justify-center">
              <div
                dangerouslySetInnerHTML={{
                  __html: generateCode128Svg(barcodeModalStudent.barcode, {
                    height: 60,
                    moduleWidth: 2,
                  }),
                }}
              />
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm text-[#0A1C33]">
                {barcodeModalStudent.fullName}
              </p>
              <p className="text-slate-500 font-mono">
                {barcodeModalStudent.studentNumber} • {barcodeModalStudent.yearSection}
              </p>
              <p className="text-slate-600">{barcodeModalStudent.department}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleReissueBarcode(barcodeModalStudent)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 text-xs font-semibold transition-colors"
              >
                <RefreshCw size={12} />
                <span>Re-issue Code</span>
              </button>

              <button
                type="button"
                onClick={() => handlePrintBarcode(barcodeModalStudent)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#0E294B] hover:bg-[#143765] text-white text-xs font-bold transition-colors"
              >
                <Printer size={13} className="text-[#DEB033]" />
                <span>Print ID Badge</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Student Modal */}
      {(isAddModalOpen || editingStudent) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingStudent(null);
          }}
          title={editingStudent ? 'Edit Student Credential' : 'Add New Enrolled Student'}
          maxWidth="md"
        >
          <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name (include Cadet title if maritime)
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Cadet Juan M. Luna"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Student Number
                </label>
                <input
                  type="text"
                  required
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                  placeholder="e.g. JBLCF-2026-0899"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={formGender}
                  onChange={(e) => setFormGender(e.target.value as 'male' | 'female')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                  <option value="College of Business & Education">Business &amp; Education</option>
                  <option value="Senior High School">Senior High School</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Year &amp; Section
                </label>
                <input
                  type="text"
                  required
                  value={formSection}
                  onChange={(e) => setFormSection(e.target.value)}
                  placeholder="e.g. BSMT 2-Alpha"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="text"
                value={formEmergency}
                onChange={(e) => setFormEmergency(e.target.value)}
                placeholder="+63 917 555 0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0E294B] hover:bg-[#143765] text-white rounded-md font-bold shadow-xs"
              >
                {editingStudent ? 'Save Changes' : 'Enroll Student'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
