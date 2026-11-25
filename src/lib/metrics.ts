/**
 * Pure, unit-testable metrics derivation. (N3 fix)
 *
 * Derives all dashboard counters from the actual stored records + student list.
 * Never reads from hard-coded constants at runtime.
 * "Today" is always Asia/Manila calendar date.
 */

import { AttendanceRecord, Student, DailyMetrics } from '../types/attendance';
import { getManilaDateKey, formatDatePHT } from './time';

/**
 * Derives a DailyMetrics snapshot from records and students for a given Manila date.
 *
 * @param records  - Full persisted record list (all dates)
 * @param students - Full active student list
 * @param dateKey  - "YYYY-MM-DD" in Asia/Manila; defaults to today
 */
export function computeMetrics(
  records: AttendanceRecord[],
  students: Student[],
  dateKey: string
): DailyMetrics {
  const activeStudents = students.filter((s) => s.isActive);
  const totalEnrolled = activeStudents.length;

  // Records that belong to this date and are not voided
  const dayRecords = records.filter(
    (r) =>
      r.scanType === 'time-in' &&
      !r.voidedAt &&
      getManilaDateKey(r.timestamp) === dateKey
  );

  // De-duplicate: one record per student (last wins within the day — should not
  // happen after N1/N2 fixes, but guard just in case)
  const byStudent = new Map<string, AttendanceRecord>();
  for (const r of dayRecords) {
    byStudent.set(r.studentId, r);
  }

  const presentRecords = Array.from(byStudent.values()).filter(
    (r) => r.status === 'present' || r.status === 'late'
  );
  const lateRecords = Array.from(byStudent.values()).filter(
    (r) => r.status === 'late'
  );
  const excusedRecords = Array.from(byStudent.values()).filter(
    (r) => r.status === 'excused'
  );

  const presentCount = presentRecords.length;
  const lateArrivals = lateRecords.length;
  const totalExcused = excusedRecords.length;

  const presentStudentIds = new Set(presentRecords.map((r) => r.studentId));
  const totalAbsences = activeStudents.filter(
    (s) => !presentStudentIds.has(s.id)
  ).length;
  const absentExcused = totalExcused;
  const absentUnexcused = Math.max(0, totalAbsences - absentExcused);

  const maleStudents = activeStudents.filter((s) => s.gender === 'male');
  const femaleStudents = activeStudents.filter((s) => s.gender === 'female');

  const boysPresent = presentRecords.filter((r) => r.gender === 'male').length;
  const girlsPresent = presentRecords.filter((r) => r.gender === 'female').length;

  const boysTotal = maleStudents.length;
  const girlsTotal = femaleStudents.length;

  const pct = (n: number, d: number) =>
    d === 0 ? 0 : Number(((n / d) * 100).toFixed(1));

  // displayDate: readable long form e.g. "Friday, November 21, 2026"
  // Build a Date from the dateKey in Manila local time
  const [y, m, d] = dateKey.split('-').map(Number);
  // Use noon to avoid any DST edge — Manila has no DST but this is defensive
  const dateForDisplay = new Date(`${dateKey}T12:00:00+08:00`);
  const displayDate = formatDatePHT(dateForDisplay) || `${y}-${m}-${d}`;

  return {
    date: dateKey,
    displayDate,
    totalEnrolled,
    presentCount,
    presentPercentage: pct(presentCount, totalEnrolled),
    boysPresent,
    boysTotal,
    boysPercentage: pct(boysPresent, boysTotal),
    girlsPresent,
    girlsTotal,
    girlsPercentage: pct(girlsPresent, girlsTotal),
    totalAbsences,
    absentUnexcused,
    absentExcused,
    lateArrivals,
  };
}
