import { formatTimePHT } from './time';
import { AttendanceRecord } from '../types/attendance';

export interface CsvColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
}

/**
 * Sanitizes a single cell value for CSV export:
 * 1. Converts null/undefined to empty string
 * 2. Neutralizes spreadsheet formula injection (=, +, -, @, tab, CR)
 * 3. Escapes internal double quotes by doubling them ("" -> """")
 * 4. Wraps cell in double quotes
 */
export function sanitizeCsvCell(raw: string | number | boolean | null | undefined): string {
  if (raw === null || raw === undefined) {
    return '""';
  }

  let str = String(raw);

  // Guard against formula injection in Excel / Google Sheets
  const formulaChars = ['=', '+', '-', '@', '\t', '\r'];
  if (formulaChars.some((char) => str.startsWith(char))) {
    str = `'${str}`;
  }

  // Escape double quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Converts a dataset to a safe, Excel-compatible CSV string with UTF-8 BOM.
 */
export function toCsv<T>(columns: CsvColumn<T>[], data: T[]): string {
  const headerRow = columns.map((c) => sanitizeCsvCell(c.header)).join(',');
  const dataRows = data.map((row) =>
    columns.map((c) => sanitizeCsvCell(c.accessor(row))).join(',')
  );

  // \uFEFF is UTF-8 Byte Order Mark (BOM) ensuring Excel displays UTF-8 (e.g. ñ, á) correctly
  return `\uFEFF${[headerRow, ...dataRows].join('\r\n')}`;
}

/**
 * Default CSV columns for Attendance Records.
 * Includes both ISO 8601 timestamp and Manila 12-hour formatted display time.
 */
export const ATTENDANCE_RECORD_CSV_COLUMNS: CsvColumn<AttendanceRecord>[] = [
  { header: 'Student ID', accessor: (r) => r.studentNumber },
  { header: 'Full Name', accessor: (r) => r.studentName },
  { header: 'Section', accessor: (r) => r.yearSection },
  { header: 'Department', accessor: (r) => r.department },
  { header: 'Gender', accessor: (r) => r.gender },
  { header: 'Timestamp (ISO 8601)', accessor: (r) => r.timestamp },
  { header: 'Time (PHT)', accessor: (r) => formatTimePHT(r.timestamp) },
  { header: 'Gate / Station', accessor: (r) => r.scannerLocation },
  { header: 'Status', accessor: (r) => r.status.toUpperCase() },
  { header: 'Verification Method', accessor: (r) => r.verificationMethod },
  { header: 'Manual Reason', accessor: (r) => r.manualReason || '' },
];

/**
 * Triggers a client-side file download for a CSV string.
 */
export function downloadCsvFile(filename: string, csvContent: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

