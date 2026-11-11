import {
  Student,
  AttendanceRecord,
  Settings,
  Notice,
  DEFAULT_SETTINGS,
} from '@/types/attendance';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  initials: string;
  role: 'admin' | 'teacher';
}

export const DEFAULT_PROFILE: UserProfile = {
  id: 'user-1',
  name: 'Capt. Roberto M. Sian',
  email: 'r.sian@jblcf-bacolod.edu.ph',
  department: 'College of Maritime Education',
  initials: 'RS',
  role: 'admin',
};

export interface AttendanceApi {
  listStudents(): Promise<Student[]>;
  saveStudents(students: Student[]): Promise<void>;

  listRecords(): Promise<AttendanceRecord[]>;
  saveRecords(records: AttendanceRecord[]): Promise<void>;

  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;

  getProfile(): Promise<UserProfile>;
  saveProfile(profile: UserProfile): Promise<void>;

  listNotices(): Promise<Notice[]>;
}

// Re-export DEFAULT_SETTINGS so the adapter can reference it without a circular import
export { DEFAULT_SETTINGS };

