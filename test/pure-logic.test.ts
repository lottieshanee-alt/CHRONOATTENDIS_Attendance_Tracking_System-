import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { resolveScan } from '../src/lib/scan';
import { isLatePHT, getManilaDateKey } from '../src/lib/time';
import { toCsv, sanitizeCsvCell, CsvColumn } from '../src/lib/csv';
import { computeMetrics } from '../src/lib/metrics';
import { createSession, deriveAbsences, voidRecord } from '../src/lib/session';
import { signSessionPayload, verifySessionToken } from '../src/lib/auth/crypto';
import {
  isLockedOut,
  recordFailedAttempt,
  clearAttempts,
  getRemainingLockoutSeconds,
} from '../src/lib/auth/lockout';
import { Student, AttendanceRecord, Session, Notice } from '../src/types/attendance';
import { SessionData } from '../src/lib/auth/constants';
const MOCK_STUDENTS: Student[] = [
  {
    id: 's-101',
    studentNumber: 'JBLCF-2024-0198',
    barcode: '20240198001',
    fullName: 'Cadet Joshua M. Dela Cruz',
    gender: 'male',
    department: 'College of Maritime Education',
    course: 'BS Marine Transportation',
    yearSection: 'BSMT 2-Alpha',
    isActive: true,
  },
  {
    id: 's-102',
    studentNumber: 'JBLCF-2024-0412',
    barcode: '20240412002',
    fullName: 'Cadet Maria Teresa G. Alcantara',
    gender: 'female',
    department: 'College of Maritime Education',
    course: 'BS Marine Transportation',
    yearSection: 'BSMT 2-Bravo',
    isActive: true,
  },
  {
    id: 's-revoked',
    studentNumber: 'JBLCF-2024-9999',
    barcode: '20249999000',
    fullName: 'Cadet Revoked Barcode',
    gender: 'male',
    department: 'College of Maritime Education',
    course: 'BS Marine Transportation',
    yearSection: 'BSMT 2-Alpha',
    isActive: true,
    barcodeRevokedAt: '2026-10-15T08:00:00+08:00',
  },
  {
    id: 's-inactive',
    studentNumber: 'JBLCF-2024-0000',
    barcode: '20240000000',
    fullName: 'Deactivated Student',
    gender: 'male',
    department: 'College of Maritime Education',
    course: 'BS Marine Transportation',
    yearSection: 'BSMT 2-Alpha',
    isActive: false,
  },
];

describe('resolveScan', () => {
  it('resolves valid student on time as PRESENT (B3)', () => {
    const outcome = resolveScan('20240198001', {
      students: MOCK_STUDENTS,
      existingRecords: [],
      now: '2026-10-22T07:20:00+08:00',
      lateCutoffTime: '07:45',
    });

    assert.equal(outcome.type, 'PRESENT');
    assert.equal(outcome.tone, 'success');
    assert.ok(outcome.record);
    assert.equal(outcome.record?.status, 'present');
    assert.equal(outcome.record?.studentNumber, 'JBLCF-2024-0198');
  });

  it('resolves valid student past cutoff as LATE (B3)', () => {
    const outcome = resolveScan('20240198001', {
      students: MOCK_STUDENTS,
      existingRecords: [],
      now: '2026-10-22T07:46:00+08:00',
      lateCutoffTime: '07:45',
    });

    assert.equal(outcome.type, 'LATE');
    assert.equal(outcome.tone, 'warning');
    assert.ok(outcome.record);
    assert.equal(outcome.record?.status, 'late');
  });

  it('rejects duplicate scan for already checked-in student without creating new record (B1)', () => {
    const existingRecord: AttendanceRecord = {
      id: 'rec-001',
      studentId: 's-101',
      studentName: 'Cadet Joshua M. Dela Cruz',
      studentNumber: 'JBLCF-2024-0198',
      yearSection: 'BSMT 2-Alpha',
      department: 'College of Maritime Education',
      gender: 'male',
      scanType: 'time-in',
      timestamp: '2026-10-22T07:18:24+08:00',
      scannerLocation: 'Gate 1 - Main Turnstile',
      status: 'present',
      verificationMethod: 'BARCODE_HID',
    };

    const outcome = resolveScan('20240198001', {
      students: MOCK_STUDENTS,
      existingRecords: [existingRecord],
      now: '2026-10-22T07:25:00+08:00',
    });

    assert.equal(outcome.type, 'ALREADY_CHECKED_IN');
    assert.equal(outcome.tone, 'warning');
    assert.equal(outcome.record, undefined); // NO record created!
    assert.equal(outcome.existingRecord, existingRecord);
    assert.ok(outcome.message.includes('Already checked in'));
  });

  it('rejects unknown barcodes with error tone and no record created (B2)', () => {
    const outcome = resolveScan('ZZZ99999', {
      students: MOCK_STUDENTS,
      existingRecords: [],
      now: '2026-10-22T07:20:00+08:00',
    });

    assert.equal(outcome.type, 'NOT_RECOGNIZED');
    assert.equal(outcome.tone, 'error');
    assert.equal(outcome.record, undefined); // NO record created!
    assert.ok(outcome.message.includes('Barcode not recognized'));
  });

  it('rejects revoked barcodes (Item 9)', () => {
    const outcome = resolveScan('20249999000', {
      students: MOCK_STUDENTS,
      existingRecords: [],
      now: '2026-10-22T07:20:00+08:00',
    });

    assert.equal(outcome.type, 'REVOKED_BARCODE');
    assert.equal(outcome.tone, 'error');
    assert.equal(outcome.record, undefined);
    assert.ok(outcome.message.includes('revoked'));
  });

  it('rejects deactivated students', () => {
    const outcome = resolveScan('20240000000', {
      students: MOCK_STUDENTS,
      existingRecords: [],
    });

    assert.equal(outcome.type, 'NOT_RECOGNIZED');
    assert.equal(outcome.record, undefined);
    assert.ok(outcome.message.includes('deactivated'));
  });

  it('rejects scans when the session is closed', () => {
    const closedSession: Session = {
      id: 'sess-01',
      subject: 'Nav 101',
      section: 'BSMT 2-Alpha',
      date: '2026-10-22',
      openedAt: '2026-10-22T07:00:00+08:00',
      closedAt: '2026-10-22T08:00:00+08:00',
      lateCutoffTime: '07:45',
      openedBy: 'capt-sian',
    };

    const outcome = resolveScan('20240198001', {
      students: MOCK_STUDENTS,
      existingRecords: [],
      session: closedSession,
    });

    assert.equal(outcome.type, 'SESSION_CLOSED');
    assert.equal(outcome.tone, 'warning');
    assert.equal(outcome.record, undefined);
  });
});

describe('isLatePHT boundary rules (B3 & B4)', () => {
  it('identifies 07:44:59 as on time (false)', () => {
    assert.equal(isLatePHT('2026-10-22T07:44:59+08:00', '07:45'), false);
  });

  it('identifies 07:45:00 as exactly on time boundary (false)', () => {
    assert.equal(isLatePHT('2026-10-22T07:45:00+08:00', '07:45'), false);
  });

  it('identifies 07:45:01 as late (true)', () => {
    assert.equal(isLatePHT('2026-10-22T07:45:01+08:00', '07:45'), true);
  });

  it('respects configurable cutoff times e.g. 08:00', () => {
    assert.equal(isLatePHT('2026-10-22T08:00:00+08:00', '08:00'), false);
    assert.equal(isLatePHT('2026-10-22T08:00:01+08:00', '08:00'), true);
  });
});

describe('toCsv security & formatting (H2)', () => {
  interface SampleRow {
    id: string;
    name: string;
    formulaVal: string;
  }

  const columns: CsvColumn<SampleRow>[] = [
    { header: 'ID', accessor: (r) => r.id },
    { header: 'Full Name', accessor: (r) => r.name },
    { header: 'Payload', accessor: (r) => r.formulaVal },
  ];

  it('escapes embedded quotes', () => {
    const rows: SampleRow[] = [
      { id: '1', name: 'Cadet "Ace" Dela Cruz', formulaVal: 'Normal' },
    ];
    const csv = toCsv(columns, rows);
    assert.ok(csv.includes('""Ace""'));
  });

  it('neutralizes spreadsheet formula injection (=, +, -, @)', () => {
    assert.equal(sanitizeCsvCell('=SUM(A1:A10)'), '"\'=SUM(A1:A10)"');
    assert.equal(sanitizeCsvCell('+cmd|/c calc'), '"\'+cmd|/c calc"');
    assert.equal(sanitizeCsvCell('-100'), '"\'-100"');
    assert.equal(sanitizeCsvCell('@special'), '"\'@special"');
  });

  it('includes UTF-8 BOM at index 0 for Excel support with accented characters', () => {
    const rows: SampleRow[] = [
      { id: '1', name: 'Cadet Niño Peña', formulaVal: 'Lacsón' },
    ];
    const csv = toCsv(columns, rows);
    assert.equal(csv.charCodeAt(0), 0xfeff); // UTF-8 BOM
    assert.ok(csv.includes('Niño Peña'));
    assert.ok(csv.includes('Lacsón'));
  });
});

// ─── N2: Duplicate scoping by Manila date ──────────────────────────────────────

describe('resolveScan duplicate scoping by Manila date (N2)', () => {
  const student: Student = {
    id: 's-200',
    studentNumber: 'JBLCF-2024-0200',
    barcode: '20240200001',
    fullName: 'Test Student Date Scope',
    gender: 'male',
    department: 'College of Maritime Education',
    course: 'BS Marine Transportation',
    yearSection: 'BSMT 2-Alpha',
    isActive: true,
  };

  it('allows scan on a different Manila date even if previous-day record exists (N2 fix)', () => {
    // Record from Oct 22 (previous day seed data)
    const previousDayRecord: AttendanceRecord = {
      id: 'rec-prev-day',
      studentId: 's-200',
      studentName: student.fullName,
      studentNumber: student.studentNumber,
      yearSection: student.yearSection,
      department: student.department,
      gender: 'male',
      scanType: 'time-in',
      timestamp: '2026-10-22T07:18:24+08:00', // Oct 22
      scannerLocation: 'Gate 1',
      status: 'present',
      verificationMethod: 'BARCODE_HID',
    };

    // Scanning on Nov 21 — MUST succeed despite Oct 22 record
    const outcome = resolveScan('20240200001', {
      students: [student],
      existingRecords: [previousDayRecord],
      now: '2026-11-21T07:20:00+08:00', // Nov 21
      lateCutoffTime: '07:45',
    });

    assert.equal(outcome.type, 'PRESENT', 'Cross-day duplicate must be allowed');
    assert.ok(outcome.record, 'A new record must be created');
  });

  it('rejects duplicate scan within the same Manila date (N2 fix)', () => {
    const todayRecord: AttendanceRecord = {
      id: 'rec-today',
      studentId: 's-200',
      studentName: student.fullName,
      studentNumber: student.studentNumber,
      yearSection: student.yearSection,
      department: student.department,
      gender: 'male',
      scanType: 'time-in',
      timestamp: '2026-11-21T07:15:00+08:00', // same day, earlier
      scannerLocation: 'Gate 1',
      status: 'present',
      verificationMethod: 'BARCODE_HID',
    };

    const outcome = resolveScan('20240200001', {
      students: [student],
      existingRecords: [todayRecord],
      now: '2026-11-21T07:20:00+08:00', // same Manila day
      lateCutoffTime: '07:45',
    });

    assert.equal(outcome.type, 'ALREADY_CHECKED_IN');
    assert.equal(outcome.record, undefined, 'No new record should be created');
  });

  it('midnight Manila boundary: 23:59:59 on Nov 20 and 00:00:01 on Nov 21 are different days', () => {
    const nov20 = getManilaDateKey('2026-11-20T23:59:59+08:00');
    const nov21 = getManilaDateKey('2026-11-21T00:00:01+08:00');
    assert.equal(nov20, '2026-11-20');
    assert.equal(nov21, '2026-11-21');
    assert.notEqual(nov20, nov21, 'Midnight boundary must produce different date keys');
  });
});

// ─── N3: computeMetrics derives counters from records ─────────────────────────

describe('computeMetrics derives counters from records (N3)', () => {
  const students: Student[] = [
    {
      id: 's-301', studentNumber: 'J-001', barcode: 'B001',
      fullName: 'Alice', gender: 'female', department: 'CME',
      course: 'BSMT', yearSection: 'BSMT 1-A', isActive: true,
    },
    {
      id: 's-302', studentNumber: 'J-002', barcode: 'B002',
      fullName: 'Bob', gender: 'male', department: 'CME',
      course: 'BSMT', yearSection: 'BSMT 1-A', isActive: true,
    },
    {
      id: 's-303', studentNumber: 'J-003', barcode: 'B003',
      fullName: 'Carol', gender: 'female', department: 'CME',
      course: 'BSMT', yearSection: 'BSMT 1-A', isActive: true,
    },
  ];

  const records: AttendanceRecord[] = [
    {
      id: 'r-1', studentId: 's-301', studentName: 'Alice',
      studentNumber: 'J-001', yearSection: 'BSMT 1-A', department: 'CME',
      gender: 'female', scanType: 'time-in',
      timestamp: '2026-11-21T07:20:00+08:00',
      scannerLocation: 'Gate 1', status: 'present', verificationMethod: 'BARCODE_HID',
    },
    {
      id: 'r-2', studentId: 's-302', studentName: 'Bob',
      studentNumber: 'J-002', yearSection: 'BSMT 1-A', department: 'CME',
      gender: 'male', scanType: 'time-in',
      timestamp: '2026-11-21T07:48:00+08:00', // late
      scannerLocation: 'Gate 1', status: 'late', verificationMethod: 'BARCODE_HID',
    },
    // Record from a previous day — must NOT count for 2026-11-21
    {
      id: 'r-old', studentId: 's-303', studentName: 'Carol',
      studentNumber: 'J-003', yearSection: 'BSMT 1-A', department: 'CME',
      gender: 'female', scanType: 'time-in',
      timestamp: '2026-10-22T07:20:00+08:00',
      scannerLocation: 'Gate 1', status: 'present', verificationMethod: 'BARCODE_HID',
    },
  ];

  it('counts present students for today only (N3)', () => {
    const metrics = computeMetrics(records, students, '2026-11-21');
    assert.equal(metrics.presentCount, 2, '2 students present on Nov 21');
    assert.equal(metrics.lateArrivals, 1, '1 student late on Nov 21');
    assert.equal(metrics.totalEnrolled, 3);
    // Carol scanned on Oct 22 must not appear in Nov 21 metrics
    assert.equal(metrics.totalAbsences, 1, 'Carol is absent on Nov 21');
  });

  it('after reload: metrics match the actual record list (N3)', () => {
    // Simulate: "one scan added, then page reloaded" — computed fresh
    const metrics = computeMetrics(records, students, '2026-11-21');
    assert.equal(metrics.presentCount, 2);
    assert.equal(metrics.boysPresent, 1);
    assert.equal(metrics.girlsPresent, 1);
  });

  it('voided records are excluded from counts', () => {
    const withVoid: AttendanceRecord[] = [
      ...records,
      {
        id: 'r-void', studentId: 's-303', studentName: 'Carol',
        studentNumber: 'J-003', yearSection: 'BSMT 1-A', department: 'CME',
        gender: 'female', scanType: 'time-in',
        timestamp: '2026-11-21T07:22:00+08:00',
        scannerLocation: 'Gate 1', status: 'present', verificationMethod: 'BARCODE_HID',
        voidedAt: '2026-11-21T08:00:00+08:00',
        voidedBy: 'admin',
        voidReason: 'Scanned by mistake',
      },
    ];
    const metrics = computeMetrics(withVoid, students, '2026-11-21');
    // Carol's voided record must not count
    assert.equal(metrics.presentCount, 2, 'Voided record must not increment present count');
    assert.equal(metrics.totalAbsences, 1);
  });
});

// ─── N1: One scan = one stored record ─────────────────────────────────────────

describe('addRecord deduplication: one scan = one stored record (N1)', () => {
  it('getManilaDateKey returns YYYY-MM-DD in Asia/Manila', () => {
    const key = getManilaDateKey('2026-11-21T07:20:00+08:00');
    assert.equal(key, '2026-11-21');
  });

  it('getManilaDateKey treats timestamps with +08:00 offset as Manila time', () => {
    // 2026-11-20T16:00:00Z = 2026-11-21T00:00:00+08:00
    const key = getManilaDateKey(new Date('2026-11-20T16:00:00Z'));
    assert.equal(key, '2026-11-21', 'UTC 16:00 Nov 20 = Manila midnight Nov 21');
  });
});

// ─── Chunk 2: Sessions, absent derivation & audit trail (R1, R2, R3, R5) ─────

describe('Session lifecycle, absent derivation & audit trail (Chunk 2)', () => {
  const students: Student[] = [
    {
      id: 's-alpha-1',
      studentNumber: 'JBLCF-2024-001',
      barcode: '2024001',
      fullName: 'Cadet Alpha One',
      gender: 'male',
      department: 'CME',
      course: 'BSMT',
      yearSection: 'BSMT 2-Alpha',
      isActive: true,
    },
    {
      id: 's-alpha-2',
      studentNumber: 'JBLCF-2024-002',
      barcode: '2024002',
      fullName: 'Cadet Alpha Two',
      gender: 'female',
      department: 'CME',
      course: 'BSMT',
      yearSection: 'BSMT 2-Alpha',
      isActive: true,
    },
    {
      id: 's-bravo-1',
      studentNumber: 'JBLCF-2024-003',
      barcode: '2024003',
      fullName: 'Cadet Bravo One',
      gender: 'male',
      department: 'CME',
      course: 'BSMT',
      yearSection: 'BSMT 2-Bravo',
      isActive: true,
    },
  ];

  it('createSession initializes session with Manila date and active status (R1)', () => {
    const session = createSession({
      subject: 'NAV 101 - Navigation',
      section: 'BSMT 2-Alpha',
      lateCutoffTime: '07:45',
      openedBy: 'Capt. Roberto Sian',
      now: '2026-11-21T07:00:00+08:00',
    });

    assert.ok(session.id.startsWith('sess-'));
    assert.equal(session.subject, 'NAV 101 - Navigation');
    assert.equal(session.section, 'BSMT 2-Alpha');
    assert.equal(session.date, '2026-11-21');
    assert.equal(session.closedAt, undefined);
  });

  it('resolveScan attaches sessionId and enforces section enrollment (R1, R2)', () => {
    const session = createSession({
      subject: 'NAV 101',
      section: 'BSMT 2-Alpha',
      lateCutoffTime: '07:45',
      openedBy: 'Capt. Sian',
      now: '2026-11-21T07:00:00+08:00',
    });

    // Valid student in BSMT 2-Alpha
    const validOutcome = resolveScan('2024001', {
      students,
      existingRecords: [],
      session,
      now: '2026-11-21T07:15:00+08:00',
    });
    assert.equal(validOutcome.type, 'PRESENT');
    assert.equal(validOutcome.record?.sessionId, session.id);

    // Student from BSMT 2-Bravo scanning into BSMT 2-Alpha session
    const wrongSectionOutcome = resolveScan('2024003', {
      students,
      existingRecords: [],
      session,
      now: '2026-11-21T07:16:00+08:00',
    });
    assert.equal(wrongSectionOutcome.type, 'NOT_ENROLLED');
    assert.equal(wrongSectionOutcome.record, undefined);
  });

  it('deriveAbsences generates absent records for students without a check-in upon session close (R3)', () => {
    const session = createSession({
      subject: 'NAV 101',
      section: 'BSMT 2-Alpha',
      lateCutoffTime: '07:45',
      openedBy: 'Capt. Sian',
      now: '2026-11-21T07:00:00+08:00',
    });

    // Cadet Alpha One checked in
    const checkInRecord: AttendanceRecord = {
      id: 'rec-001',
      sessionId: session.id,
      studentId: 's-alpha-1',
      studentName: 'Cadet Alpha One',
      studentNumber: 'JBLCF-2024-001',
      yearSection: 'BSMT 2-Alpha',
      department: 'CME',
      gender: 'male',
      scanType: 'time-in',
      timestamp: '2026-11-21T07:15:00+08:00',
      scannerLocation: 'Gate 1',
      status: 'present',
      verificationMethod: 'BARCODE_HID',
    };

    // Alpha Two did NOT check in; Bravo One is in another section
    const absents = deriveAbsences(session, students, [checkInRecord], '2026-11-21T08:00:00+08:00');

    assert.equal(absents.length, 1);
    assert.equal(absents[0].studentId, 's-alpha-2');
    assert.equal(absents[0].status, 'absent');
    assert.equal(absents[0].sessionId, session.id);
    assert.ok(absents[0].manualReason?.includes('Unexcused absence'));
  });

  it('voidRecord updates record with void fields and produces an AuditEntry (R5)', () => {
    const record: AttendanceRecord = {
      id: 'rec-void-test',
      studentId: 's-alpha-1',
      studentName: 'Cadet Alpha One',
      studentNumber: 'JBLCF-2024-001',
      yearSection: 'BSMT 2-Alpha',
      department: 'CME',
      gender: 'male',
      scanType: 'time-in',
      timestamp: '2026-11-21T07:15:00+08:00',
      scannerLocation: 'Gate 1',
      status: 'present',
      verificationMethod: 'BARCODE_HID',
    };

    const { updatedRecord, auditEntry } = voidRecord(
      record,
      'Capt. Roberto Sian',
      'Scanned by mistake (Undo)',
      '2026-11-21T07:16:00+08:00'
    );

    assert.equal(updatedRecord.voidedAt, '2026-11-21T07:16:00+08:00');
    assert.equal(updatedRecord.voidedBy, 'Capt. Roberto Sian');
    assert.equal(updatedRecord.voidReason, 'Scanned by mistake (Undo)');

    assert.equal(auditEntry.action, 'VOID');
    assert.equal(auditEntry.recordId, 'rec-void-test');
    assert.equal(auditEntry.performedBy, 'Capt. Roberto Sian');
    assert.equal(auditEntry.reason, 'Scanned by mistake (Undo)');
  });
});

describe('Auth & Session Security (N4, N5)', () => {
  const mockSession: SessionData = {
    userId: 'user-001',
    username: 'capt_sian',
    name: 'Capt. Roberto M. Sian',
    email: 'rsian@jblcf-bacolod.edu.ph',
    role: 'teacher',
    department: 'College of Maritime Education',
    initials: 'RS',
    loginAt: '2026-11-25T18:00:00+08:00',
    expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour future
  };

  it('signs and verifies session token with HMAC-SHA-256 (N4)', () => {
    const token = signSessionPayload(mockSession);
    assert.ok(token);
    assert.ok(token.includes('.'));

    const verified = verifySessionToken(token);
    assert.ok(verified);
    assert.equal(verified?.username, 'capt_sian');
    assert.equal(verified?.role, 'teacher');
  });

  it('rejects tampered session token (N4)', () => {
    const token = signSessionPayload(mockSession);
    const [, signature] = token.split('.');

    // Tamper with payload by changing role to admin
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...mockSession, role: 'admin' })
    ).toString('base64url');

    const tamperedToken = `${tamperedPayload}.${signature}`;
    const result = verifySessionToken(tamperedToken);
    assert.equal(result, null);
  });

  it('rejects expired session token (N4)', () => {
    const expiredSession: SessionData = {
      ...mockSession,
      expiresAt: Date.now() - 1000, // 1 second in the past
    };

    const token = signSessionPayload(expiredSession);
    const result = verifySessionToken(token);
    assert.equal(result, null);
  });

  it('locks out user after 5 failed login attempts for 30 seconds (N5)', () => {
    const testKey = 'test-cadet-lockout';
    clearAttempts(testKey);

    assert.equal(isLockedOut(testKey), false);

    // 4 failed attempts -> not locked out yet
    for (let i = 0; i < 4; i++) {
      recordFailedAttempt(testKey);
      assert.equal(isLockedOut(testKey), false);
    }

    // 5th failed attempt -> locked out
    const lockoutState = recordFailedAttempt(testKey);
    assert.equal(lockoutState.isLocked, true);
    assert.ok(lockoutState.remainingSeconds > 0);
    assert.equal(isLockedOut(testKey), true);
    assert.ok(getRemainingLockoutSeconds(testKey) > 0);

    // Clearing attempts releases lockout
    clearAttempts(testKey);
    assert.equal(isLockedOut(testKey), false);
  });
});

describe('Notice Board sorting and unread logic (D8, N11, R13, R16)', () => {
  const notices: Notice[] = [
    {
      id: 'n-1',
      memoNumber: 'MEMO-001',
      title: 'Old Circular',
      body: 'Old circular text',
      category: 'Administrative Memo',
      author: 'Office of the Registrar',
      postedAt: '2026-10-01T08:00:00+08:00',
      audience: 'All',
      isPinned: false,
      isUrgent: false,
      readAt: '2026-10-02T09:00:00+08:00',
    },
    {
      id: 'n-2',
      memoNumber: 'MEMO-002',
      title: 'Newest Unpinned Circular',
      body: 'Recent text',
      category: 'Academic Advisory',
      author: 'Dean',
      postedAt: '2026-11-20T08:00:00+08:00',
      audience: 'Students',
      isPinned: false,
      isUrgent: false,
    },
    {
      id: 'n-3',
      memoNumber: 'MEMO-003',
      title: 'Important Pinned Directive',
      body: 'Important text',
      category: 'Regimental Order',
      author: 'Commandant',
      postedAt: '2026-10-15T08:00:00+08:00',
      audience: 'Cadets',
      isPinned: true,
      isUrgent: true,
    },
  ];

  it('calculates unread notices count correctly (R16)', () => {
    const unread = notices.filter((n) => !n.readAt).length;
    assert.equal(unread, 2); // n-2 and n-3 are unread; n-1 is read
  });

  it('sorts pinned notices first, then date descending (R13)', () => {
    const sorted = [...notices].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });

    assert.equal(sorted[0].id, 'n-3'); // Pinned first
    assert.equal(sorted[1].id, 'n-2'); // Newer unpinned second
    assert.equal(sorted[2].id, 'n-1'); // Older unpinned last
  });
});
