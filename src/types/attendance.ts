// ─── Primitives ────────────────────────────────────────────────────────────────

export type Gender = 'male' | 'female';

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

export type ScanType = 'time-in' | 'time-out';

export type VerificationMethod = 'BARCODE_HID' | 'MANUAL_OVERRIDE';

export type Role = 'admin' | 'teacher';

// ─── Entities ──────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  studentNumber: string; // e.g. "JBLCF-2024-0821"
  barcode: string;        // e.g. "890123408219"
  fullName: string;
  gender: Gender;
  department: string;     // e.g. "College of Maritime Education"
  course: string;         // e.g. "BS Marine Transportation"
  yearSection: string;    // e.g. "BSMT 2-Alpha"
  avatarUrl?: string;
  emergencyContact?: string;
  guardianPhone?: string;
  isActive: boolean;      // false = deactivated (never deleted)
  barcodeRevokedAt?: string; // ISO 8601 — set when a new barcode is issued
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  yearSection: string;
  department: string;
  gender: Gender;
  scanType: ScanType;
  /** ISO 8601 with offset, e.g. "2026-10-22T07:18:24+08:00" */
  timestamp: string;
  scannerLocation: string; // e.g. "Gate 1 - Main Turnstile"
  status: AttendanceStatus;
  verificationMethod: VerificationMethod;
  manualReason?: string;  // required when verificationMethod === 'MANUAL_OVERRIDE'
  voidedAt?: string;      // ISO 8601 — set when record is voided
  voidedBy?: string;      // userId of the officer who voided it
  voidReason?: string;
}

// ─── Session ───────────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  subject: string;
  section: string;
  date: string;          // ISO date "YYYY-MM-DD" (Asia/Manila)
  openedAt: string;      // ISO 8601
  closedAt?: string;     // ISO 8601 — undefined while open
  lateCutoffTime: string; // "HH:MM" 24-hour, e.g. "07:45"
  openedBy: string;      // userId
}

// ─── Scan outcomes ─────────────────────────────────────────────────────────────

export type ScanOutcomeType =
  | 'PRESENT'
  | 'LATE'
  | 'ALREADY_CHECKED_IN'
  | 'NOT_RECOGNIZED'
  | 'REVOKED_BARCODE'
  | 'NOT_ENROLLED'
  | 'SESSION_CLOSED';

export interface ScanOutcome {
  type: ScanOutcomeType;
  record?: AttendanceRecord; // set when a record was created
  existingRecord?: AttendanceRecord; // set for ALREADY_CHECKED_IN
  student?: Student; // set when student is matched
  message: string; // human-readable result
  tone: 'success' | 'warning' | 'error';
}

// ─── Audit trail ───────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  recordId: string;
  action: 'CREATE' | 'VOID' | 'EXCUSE' | 'MANUAL_MARK';
  performedBy: string;         // userId
  performedAt: string;         // ISO 8601
  reason: string;
  before?: Partial<AttendanceRecord>;
  after?: Partial<AttendanceRecord>;
}

// ─── Settings ──────────────────────────────────────────────────────────────────

export interface Settings {
  lateCutoffTime: string;      // "HH:MM" 24-hour, default "07:45"
  duplicateCooldownMs: number; // default 3000
  scannerIntervalMs: number;   // keystroke max interval, default 50
  minBarcodeLength: number;    // default 4
  audioEnabled: boolean;
  showGenderSplit: boolean;    // default false (H6)
}

export const DEFAULT_SETTINGS: Settings = {
  lateCutoffTime: '07:45',
  duplicateCooldownMs: 3000,
  scannerIntervalMs: 50,
  minBarcodeLength: 4,
  audioEnabled: true,
  showGenderSplit: false,
};

// ─── Notices ───────────────────────────────────────────────────────────────────

export interface Notice {
  id: string;
  memoNumber: string;
  title: string;
  body: string;
  category: 'Regimental Order' | 'Academic Advisory' | 'Administrative Memo';
  author: string;
  postedAt: string;       // ISO 8601
  expiresAt?: string;     // ISO 8601 — undefined = no expiry
  audience: 'All' | 'Faculty' | 'Students' | 'Cadets';
  isPinned: boolean;
  isUrgent: boolean;
}

// ─── Analytics types (unchanged) ───────────────────────────────────────────────

export interface DailyMetrics {
  date: string;
  displayDate: string;
  totalEnrolled: number;
  presentCount: number;
  presentPercentage: number;
  boysPresent: number;
  boysTotal: number;
  boysPercentage: number;
  girlsPresent: number;
  girlsTotal: number;
  girlsPercentage: number;
  totalAbsences: number;
  absentUnexcused: number;
  absentExcused: number;
  lateArrivals: number;
}

export interface HourlyTraffic {
  hour: string;
  timeIn: number;
  timeOut: number;
  expectedLoad: number;
}

export interface ClassAttendanceStat {
  section: string;
  department: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
}

export interface AcademicEvent {
  id: string;
  title: string;
  category: 'Ceremony' | 'Drill' | 'Academic' | 'Inspection' | 'Holiday';
  time: string;
  location: string;
  officerInCharge: string;
  departmentScope: string;
}

export interface ActivityHighlight {
  id: string;
  title: string;
  badge: string;
  timestamp: string;
  location: string;
  description: string;
  enrolledStudentsCount: number;
  verifiedCount: number;
}

