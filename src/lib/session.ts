/**
 * Pure session and audit trail logic for ChronoAttendis (R1, R3, R5).
 * Follows strict pure-function principles for deterministic unit testing.
 */

import {
  Session,
  Student,
  AttendanceRecord,
  AuditEntry,
} from '../types/attendance';
import { toManilaISO, getManilaDateKey } from './time';

export interface CreateSessionParams {
  subject: string;
  section: string;
  lateCutoffTime: string;
  openedBy: string;
  now?: Date | string;
}

/**
 * Creates a new open session object.
 */
export function createSession(params: CreateSessionParams): Session {
  const {
    subject,
    section,
    lateCutoffTime,
    openedBy,
    now = new Date(),
  } = params;

  const isoNow = toManilaISO(now);
  const dateKey = getManilaDateKey(now);
  const id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  return {
    id,
    subject: subject.trim(),
    section: section.trim(),
    date: dateKey,
    openedAt: isoNow,
    lateCutoffTime,
    openedBy,
  };
}

/**
 * Derives unexcused absences for students who did not check in during the session (R3).
 * When a session closes:
 * - Selects all active students enrolled in the session's section (or all sections if section is 'All Sections').
 * - Finds who has no non-voided time-in record in this session.
 * - Generates an 'absent' attendance record for each missing student.
 */
export function deriveAbsences(
  session: Session,
  students: Student[],
  existingRecords: AttendanceRecord[],
  closedAt: Date | string = new Date()
): AttendanceRecord[] {
  const isAllSections =
    session.section === 'All Sections' ||
    session.section === 'All' ||
    session.section.trim() === '';

  // 1. Enrolled, active students eligible for this session
  const enrolledStudents = students.filter((s) => {
    if (s.isActive === false) return false;
    if (isAllSections) return true;
    return s.yearSection.toLowerCase() === session.section.toLowerCase();
  });

  // 2. Student IDs that already have a non-voided check-in record for this session
  const checkedInStudentIds = new Set<string>();
  for (const r of existingRecords) {
    if (r.voidedAt) continue;
    if (r.scanType !== 'time-in') continue;

    // Matches if specifically tagged with this sessionId, or recorded on the same date for the student
    if (r.sessionId === session.id) {
      checkedInStudentIds.add(r.studentId);
    }
  }

  const isoClosedAt = toManilaISO(closedAt);
  const absentRecords: AttendanceRecord[] = [];

  // 3. For each missing student, derive an absent record
  for (const student of enrolledStudents) {
    if (!checkedInStudentIds.has(student.id)) {
      absentRecords.push({
        id: `rec-abs-${session.id}-${student.id}`,
        sessionId: session.id,
        studentId: student.id,
        studentName: student.fullName,
        studentNumber: student.studentNumber,
        yearSection: student.yearSection,
        department: student.department,
        gender: student.gender,
        scanType: 'time-in',
        timestamp: isoClosedAt,
        scannerLocation: 'System - Session Close',
        status: 'absent',
        verificationMethod: 'MANUAL_OVERRIDE',
        manualReason: `Unexcused absence automatically derived upon session close (${session.subject})`,
      });
    }
  }

  return absentRecords;
}

/**
 * Voids an attendance record and produces a corresponding AuditEntry (R5).
 */
export function voidRecord(
  record: AttendanceRecord,
  voidedBy: string,
  reason: string,
  now: Date | string = new Date()
): { updatedRecord: AttendanceRecord; auditEntry: AuditEntry } {
  const isoNow = toManilaISO(now);
  const cleanReason = reason.trim() || 'Voided by administrative officer';

  const updatedRecord: AttendanceRecord = {
    ...record,
    voidedAt: isoNow,
    voidedBy,
    voidReason: cleanReason,
  };

  const auditEntry: AuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    recordId: record.id,
    action: 'VOID',
    performedBy: voidedBy,
    performedAt: isoNow,
    reason: cleanReason,
    before: {
      status: record.status,
      scanType: record.scanType,
      verificationMethod: record.verificationMethod,
    },
    after: {
      voidedAt: isoNow,
      voidReason: cleanReason,
    },
  };

  return { updatedRecord, auditEntry };
}
