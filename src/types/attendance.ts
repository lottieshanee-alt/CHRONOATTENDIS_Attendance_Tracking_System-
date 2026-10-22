export type Gender = 'male' | 'female';

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

export type ScanType = 'time-in' | 'time-out';

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
  timestamp: string;      // ISO string or formatted HH:mm:ss
  scannerLocation: string;// e.g. "Gate 1 - Main Turnstile"
  status: AttendanceStatus;
  verificationMethod: 'BARCODE_HID' | 'MANUAL_OVERRIDE' | 'RFID_GATE';
}

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
