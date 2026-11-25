'use client';

import React, { useState, useRef, useMemo } from 'react';
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
  History,
  AlertCircle,
  Ban,
  GraduationCap,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Student } from '@/types/attendance';
import { useAttendanceStore } from '@/state/attendance-store';
import { generateCode128Svg } from '@/lib/barcode';
import { Modal } from '@/components/ui/modal';
import { StudentHistoryDrawer } from '@/components/dashboard/student-history-drawer';

interface StudentsViewProps {
  onSimulateScan: (barcode: string) => void;
}

export function StudentsView({ onSimulateScan }: StudentsViewProps) {
  const { state, saveStudents } = useAttendanceStore();
  const students = state.students;

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  // Modal & Drawer states
  const [barcodeModalStudent, setBarcodeModalStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for Add/Edit
  const [formName, setFormName] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formGender, setFormGender] = useState<'male' | 'female'>('male');
  const [formDept, setFormDept] = useState('College of Maritime Education');
  const [formCourse, setFormCourse] = useState('BS Marine Transportation');
  const [formSection, setFormSection] = useState('BSMT 1-Alpha');
  const [formEmergency, setFormEmergency] = useState('+63 917 000 0000');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Input refs for auto-focusing on first validation error (N12)
  const nameRef = useRef<HTMLInputElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLInputElement>(null);

  // Dynamic unique list of sections from directory
  const availableSections = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.yearSection) set.add(s.yearSection);
    });
    return Array.from(set).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        student.fullName.toLowerCase().includes(q) ||
        student.studentNumber.toLowerCase().includes(q) ||
        student.barcode.includes(q) ||
        student.yearSection.toLowerCase().includes(q);

      const matchesDept =
        selectedDept === 'all' || student.department.includes(selectedDept);

      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active' ? student.isActive : !student.isActive);

      const matchesSection =
        selectedSection === 'all' || student.yearSection === selectedSection;

      return matchesSearch && matchesDept && matchesStatus && matchesSection;
    });
  }, [students, search, selectedDept, selectedStatus, selectedSection]);

  const openAddModal = () => {
    const nextSeq = String(students.length + 1).padStart(3, '0');
    setFormName('');
    setFormNumber(`JBLCF-2026-${nextSeq}`);
    setFormGender('male');
    setFormDept('College of Maritime Education');
    setFormCourse('BS Marine Transportation');
    setFormSection('BSMT 1-Alpha');
    setFormEmergency('+63 917 000 0000');
    setFormErrors({});
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
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formName.trim()) {
      errors.name = 'Full name is required (e.g. Cadet Juan M. Luna).';
    } else if (formName.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters long.';
    }

    if (!formNumber.trim()) {
      errors.number = 'Student Number is required (e.g. JBLCF-2026-001).';
    } else {
      // Duplicate check (N12)
      const isDuplicate = students.some(
        (s) =>
          s.studentNumber.trim().toLowerCase() === formNumber.trim().toLowerCase() &&
          s.id !== editingStudent?.id
      );
      if (isDuplicate) {
        errors.number = `Student number "${formNumber.trim()}" is already registered to another student.`;
      }
    }

    if (!formSection.trim()) {
      errors.section = 'Year and section are required (e.g. BSMT 2-Alpha).';
    }

    setFormErrors(errors);

    // Focus first invalid input (N12)
    if (errors.name) {
      nameRef.current?.focus();
    } else if (errors.number) {
      numberRef.current?.focus();
    } else if (errors.section) {
      sectionRef.current?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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
              yearSection: formSection.trim(),
              emergencyContact: formEmergency.trim(),
            }
          : s
      );
      await saveStudents(updated);
      setEditingStudent(null);
    } else {
      // Create new student with verified unique barcode
      const newBarcode = `2026${Date.now().toString().slice(-7)}`;
      const newStudent: Student = {
        id: `s-${Date.now()}`,
        studentNumber: formNumber.trim(),
        barcode: newBarcode,
        fullName: formName.trim(),
        gender: formGender,
        department: formDept,
        course: formCourse,
        yearSection: formSection.trim(),
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

  const handleRevokeBarcode = async (student: Student) => {
    if (
      !confirm(
        `Revoke barcode ${student.barcode} for ${student.fullName}? Scans using this barcode will be rejected until re-issued.`
      )
    ) {
      return;
    }

    const updated = students.map((s) =>
      s.id === student.id
        ? {
            ...s,
            barcodeRevokedAt: new Date().toISOString(),
          }
        : s
    );
    await saveStudents(updated);
    if (barcodeModalStudent?.id === student.id) {
      setBarcodeModalStudent({
        ...student,
        barcodeRevokedAt: new Date().toISOString(),
      });
    }
  };

  const handleReissueBarcode = async (student: Student) => {
    if (
      !confirm(
        `Re-issue new barcode for ${student.fullName}? A fresh Code 128 identifier will be generated and active.`
      )
    ) {
      return;
    }
    const newBarcode = `2026${Date.now().toString().slice(-7)}`;
    const updated = students.map((s) =>
      s.id === student.id
        ? {
            ...s,
            barcode: newBarcode,
            barcodeRevokedAt: undefined,
          }
        : s
    );
    await saveStudents(updated);
    if (barcodeModalStudent?.id === student.id) {
      setBarcodeModalStudent({
        ...student,
        barcode: newBarcode,
        barcodeRevokedAt: undefined,
      });
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
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#0A1C33]">
              Student &amp; Cadet Enrollment Directory
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {filteredStudents.length} of {students.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional barcode credentials &amp; individual attendance tracking for JBLCF-Bacolod
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0E294B] hover:bg-[#143765] text-white text-xs font-bold rounded-md shadow-sm transition-colors shrink-0 self-start md:self-auto"
        >
          <Plus size={15} />
          <span>Add Student</span>
        </button>
      </div>

      {/* Filter and Search Toolbar (R9) */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by cadet name, student ID, section, or barcode..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B] focus:border-[#0E294B]"
            />
          </div>

          {/* Section Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              aria-label="Filter by Year & Section"
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
            >
              <option value="all">All Sections</option>
              {availableSections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as 'all' | 'active' | 'inactive')
              }
              aria-label="Filter by Enrollment Status"
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Department Quick Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <span className="text-[11px] font-semibold text-slate-500 mr-1 shrink-0">
            Unit:
          </span>
          {['all', 'Maritime', 'Business', 'Senior High'].map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              className={cn(
                'px-3 py-1 rounded text-xs font-semibold capitalize transition-colors shrink-0',
                selectedDept === dept
                  ? 'bg-[#0E294B] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {dept === 'all' ? 'All Units' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <GraduationCap className="mx-auto text-slate-300 mb-2" size={32} />
          <h3 className="text-sm font-bold text-slate-700">No students matched</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query, section selector, or department filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const isDeactivated = !student.isActive;
            const isRevoked = Boolean(student.barcodeRevokedAt);

            return (
              <div
                key={student.id}
                className={cn(
                  'bg-white rounded-lg border p-4 shadow-sm space-y-3 transition-colors flex flex-col justify-between hover:shadow-md',
                  isDeactivated
                    ? 'border-slate-200 bg-slate-50/70 opacity-75'
                    : isRevoked
                    ? 'border-red-200 bg-red-50/30'
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-[#0A1C33] truncate">
                            {student.fullName}
                          </span>
                          {isDeactivated && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 text-slate-600">
                              INACTIVE
                            </span>
                          )}
                          {isRevoked && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-100 text-red-700 border border-red-200">
                              REVOKED
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
                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                        title="Edit Student Info"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(student)}
                        aria-label={
                          isDeactivated
                            ? `Activate ${student.fullName}`
                            : `Deactivate ${student.fullName}`
                        }
                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                        title={
                          isDeactivated ? 'Activate Student' : 'Deactivate Student'
                        }
                      >
                        {isDeactivated ? (
                          <UserCheck size={14} className="text-emerald-600" />
                        ) : (
                          <UserX size={14} className="text-amber-600" />
                        )}
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

                {/* Actions & History Toolbar (R10) */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBarcodeModalStudent(student)}
                      className="flex items-center gap-1 font-mono text-[11px] text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded transition-colors"
                      title="View barcode badge & print"
                    >
                      <QrCode size={12} className="text-[#0E294B]" />
                      <span>{student.barcode.slice(-6)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHistoryStudent(student)}
                      className="flex items-center gap-1 px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 transition-colors"
                      title="View complete attendance history"
                    >
                      <History size={12} className="text-[#0E294B]" />
                      <span>History</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSimulateScan(student.barcode)}
                    disabled={isDeactivated || isRevoked}
                    title={
                      isRevoked
                        ? 'Barcode Revoked — Scan Rejected'
                        : isDeactivated
                        ? 'Deactivated Student'
                        : 'Simulate Turnstile Barcode Scan'
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0E294B] hover:bg-[#143765] text-white text-[11px] font-bold shadow-xs transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Zap size={11} className="text-[#DEB033]" />
                    <span>Scan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student Attendance History Drawer (R10) */}
      {historyStudent && (
        <StudentHistoryDrawer
          student={historyStudent}
          records={state.records}
          onClose={() => setHistoryStudent(null)}
          onSimulateScan={onSimulateScan}
        />
      )}

      {/* Barcode Viewer & Revocation Modal (R12) */}
      {barcodeModalStudent && (
        <Modal
          isOpen={true}
          onClose={() => setBarcodeModalStudent(null)}
          title="Institutional Barcode Identifier"
          maxWidth="sm"
        >
          <div className="space-y-4 text-center">
            {barcodeModalStudent.barcodeRevokedAt ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                <strong className="block font-bold mb-0.5">Barcode Revoked</strong>
                Revoked on {barcodeModalStudent.barcodeRevokedAt.slice(0, 10)}. This barcode is rejected at all scanner stations.
              </div>
            ) : (
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
            )}

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
              {barcodeModalStudent.barcodeRevokedAt ? (
                <button
                  type="button"
                  onClick={() => handleReissueBarcode(barcodeModalStudent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0E294B] text-white hover:bg-[#143765] text-xs font-bold transition-colors"
                >
                  <RefreshCw size={12} />
                  <span>Re-issue Code</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRevokeBarcode(barcodeModalStudent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors"
                >
                  <Ban size={12} />
                  <span>Revoke Barcode</span>
                </button>
              )}

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

      {/* Add / Edit Student Modal with strict validation (N12) */}
      {(isAddModalOpen || editingStudent) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingStudent(null);
            setFormErrors({});
          }}
          title={
            editingStudent
              ? 'Edit Cadet & Student Credentials'
              : 'Enroll New Student in Directory'
          }
          maxWidth="md"
        >
          <form onSubmit={handleSaveStudent} noValidate className="space-y-4 text-xs">
            {/* Top error banner if any error exists (N12) */}
            {Object.keys(formErrors).length > 0 && (
              <div
                role="alert"
                className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-red-800 text-xs"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <div>
                  <span className="font-bold block">
                    Please correct the following errors before submitting:
                  </span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {Object.values(formErrors).map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="student-form-name"
                className="block font-semibold text-slate-700 mb-1"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                ref={nameRef}
                id="student-form-name"
                type="text"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (formErrors.name) {
                    setFormErrors((prev) => ({ ...prev, name: '' }));
                  }
                }}
                placeholder="e.g. Cadet Juan M. Luna"
                aria-invalid={Boolean(formErrors.name)}
                className={cn(
                  'w-full px-3 py-2 bg-slate-50 border rounded-md focus:bg-white focus:outline-none focus:ring-1',
                  formErrors.name
                    ? 'border-red-400 focus:ring-red-500 bg-red-50/30'
                    : 'border-slate-300 focus:ring-[#0E294B]'
                )}
              />
              {formErrors.name && (
                <p className="text-red-600 text-[11px] mt-1">{formErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="student-form-number"
                  className="block font-semibold text-slate-700 mb-1"
                >
                  Student Number <span className="text-red-500">*</span>
                </label>
                <input
                  ref={numberRef}
                  id="student-form-number"
                  type="text"
                  value={formNumber}
                  onChange={(e) => {
                    setFormNumber(e.target.value);
                    if (formErrors.number) {
                      setFormErrors((prev) => ({ ...prev, number: '' }));
                    }
                  }}
                  placeholder="e.g. JBLCF-2026-0899"
                  aria-invalid={Boolean(formErrors.number)}
                  className={cn(
                    'w-full px-3 py-2 bg-slate-50 border rounded-md focus:bg-white focus:outline-none focus:ring-1 font-mono',
                    formErrors.number
                      ? 'border-red-400 focus:ring-red-500 bg-red-50/30'
                      : 'border-slate-300 focus:ring-[#0E294B]'
                  )}
                />
                {formErrors.number && (
                  <p className="text-red-600 text-[11px] mt-1">{formErrors.number}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="student-form-gender"
                  className="block font-semibold text-slate-700 mb-1"
                >
                  Gender
                </label>
                <select
                  id="student-form-gender"
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
                <label
                  htmlFor="student-form-dept"
                  className="block font-semibold text-slate-700 mb-1"
                >
                  Academic Unit
                </label>
                <select
                  id="student-form-dept"
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
                <label
                  htmlFor="student-form-section"
                  className="block font-semibold text-slate-700 mb-1"
                >
                  Year &amp; Section <span className="text-red-500">*</span>
                </label>
                <input
                  ref={sectionRef}
                  id="student-form-section"
                  type="text"
                  value={formSection}
                  onChange={(e) => {
                    setFormSection(e.target.value);
                    if (formErrors.section) {
                      setFormErrors((prev) => ({ ...prev, section: '' }));
                    }
                  }}
                  placeholder="e.g. BSMT 2-Alpha"
                  aria-invalid={Boolean(formErrors.section)}
                  className={cn(
                    'w-full px-3 py-2 bg-slate-50 border rounded-md focus:bg-white focus:outline-none focus:ring-1',
                    formErrors.section
                      ? 'border-red-400 focus:ring-red-500 bg-red-50/30'
                      : 'border-slate-300 focus:ring-[#0E294B]'
                  )}
                />
                {formErrors.section && (
                  <p className="text-red-600 text-[11px] mt-1">{formErrors.section}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="student-form-emergency"
                className="block font-semibold text-slate-700 mb-1"
              >
                Emergency Contact Phone
              </label>
              <input
                id="student-form-emergency"
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
                  setFormErrors({});
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
