import { Student, AttendanceRecord, Session, ScanOutcome } from '../types/attendance';
import { isLatePHT, toManilaISO, formatTimePHT } from './time';

export interface ScanContext {
  students: Student[];
  existingRecords: AttendanceRecord[];
  session?: Session | null;
  lateCutoffTime?: string;
  now?: Date | string;
  scannerLocation?: string;
}

/**
 * Pure, unit-testable scan resolution function.
 * Evaluates barcodes against student directory, session boundaries, duplicate rules, and cutoff times.
 */
export function resolveScan(barcode: string, context: ScanContext): ScanOutcome {
  const {
    students,
    existingRecords,
    session,
    lateCutoffTime = '07:45',
    now = new Date(),
    scannerLocation = 'Gate 1 - Main Turnstile',
  } = context;

  const cleanBarcode = barcode.trim();

  // 1. Minimum sanity check
  if (!cleanBarcode) {
    return {
      type: 'NOT_RECOGNIZED',
      message: 'Barcode input cannot be empty.',
      tone: 'error',
    };
  }

  // 2. Check if active session is closed
  if (session && session.closedAt) {
    return {
      type: 'SESSION_CLOSED',
      message: `Attendance session for ${session.section} is closed.`,
      tone: 'warning',
    };
  }

  // 3. Match student by barcode or student number (case-insensitive)
  const matchedStudent = students.find(
    (s) =>
      s.barcode === cleanBarcode ||
      s.studentNumber.toLowerCase() === cleanBarcode.toLowerCase()
  );

  // 4. Unknown barcode -> DO NOT record, DO NOT increment counts (B2 fix)
  if (!matchedStudent) {
    return {
      type: 'NOT_RECOGNIZED',
      message: `Barcode not recognized: "${cleanBarcode}". Manual lookup required.`,
      tone: 'error',
    };
  }

  // 5. Check if barcode is revoked
  if (matchedStudent.barcodeRevokedAt) {
    return {
      type: 'REVOKED_BARCODE',
      student: matchedStudent,
      message: `Barcode for ${matchedStudent.fullName} was revoked on ${matchedStudent.barcodeRevokedAt.slice(0, 10)}. Re-issue required.`,
      tone: 'error',
    };
  }

  // 6. Check if student is active
  if (matchedStudent.isActive === false) {
    return {
      type: 'NOT_RECOGNIZED',
      student: matchedStudent,
      message: `Student account for ${matchedStudent.fullName} is deactivated.`,
      tone: 'error',
    };
  }

  // 7. Check session section enrollment (if session has a specific section)
  if (session && session.section && matchedStudent.yearSection !== session.section) {
    return {
      type: 'NOT_ENROLLED',
      student: matchedStudent,
      message: `${matchedStudent.fullName} is enrolled in ${matchedStudent.yearSection}, not ${session.section}.`,
      tone: 'warning',
    };
  }

  // 8. Check for duplicate scan in the current session / day (B1 fix)
  const existingRecord = existingRecords.find(
    (r) =>
      r.studentId === matchedStudent.id &&
      !r.voidedAt &&
      r.scanType === 'time-in'
  );

  if (existingRecord) {
    const formattedExistingTime = formatTimePHT(existingRecord.timestamp);
    return {
      type: 'ALREADY_CHECKED_IN',
      existingRecord,
      student: matchedStudent,
      message: `Already checked in at ${formattedExistingTime} (${matchedStudent.fullName}).`,
      tone: 'warning',
    };
  }

  // 9. Evaluate cutoff time (B3 & B4 fix using Manila timezone)
  const effectiveCutoff = session?.lateCutoffTime || lateCutoffTime || '07:45';
  const isLate = isLatePHT(now, effectiveCutoff);
  const status = isLate ? 'late' : 'present';
  const isoTimestamp = toManilaISO(now);

  // 10. Generate compliant AttendanceRecord
  const record: AttendanceRecord = {
    id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    studentId: matchedStudent.id,
    studentName: matchedStudent.fullName,
    studentNumber: matchedStudent.studentNumber,
    yearSection: matchedStudent.yearSection,
    department: matchedStudent.department,
    gender: matchedStudent.gender,
    scanType: 'time-in',
    timestamp: isoTimestamp,
    scannerLocation,
    status,
    verificationMethod: 'BARCODE_HID',
  };

  const outcomeType = isLate ? 'LATE' : 'PRESENT';
  const message = isLate
    ? `Flagged Late (${formatTimePHT(isoTimestamp)}): ${matchedStudent.fullName} (${matchedStudent.yearSection})`
    : `Verified Present: ${matchedStudent.fullName} (${matchedStudent.yearSection})`;

  return {
    type: outcomeType,
    record,
    student: matchedStudent,
    message,
    tone: isLate ? 'warning' : 'success',
  };
}
