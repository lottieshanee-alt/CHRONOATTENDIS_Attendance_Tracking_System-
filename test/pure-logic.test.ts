import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { resolveScan } from '../src/lib/scan';
import { isLatePHT } from '../src/lib/time';
import { toCsv, sanitizeCsvCell, CsvColumn } from '../src/lib/csv';
import { Student, AttendanceRecord, Session } from '../src/types/attendance';

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
