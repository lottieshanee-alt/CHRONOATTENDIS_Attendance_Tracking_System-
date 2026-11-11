'use client'; // localStorage is client-only

import {
  Student,
  AttendanceRecord,
  Settings,
  Notice,
} from '@/types/attendance';
import {
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE_STREAM,
  MOCK_NOTICES,
} from '@/lib/mock-data';
import { AttendanceApi, UserProfile, DEFAULT_PROFILE, DEFAULT_SETTINGS } from './types';

const KEYS = {
  students: 'chrono_students',
  records: 'chrono_records',
  settings: 'chrono_settings',
  profile: 'chrono_profile',
};

function delay(min = 80, max = 250): Promise<void> {
  return new Promise((r) =>
    setTimeout(r, min + Math.random() * (max - min))
  );
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const mockAdapter: AttendanceApi = {
  async listStudents() {
    await delay();
    return readJson<Student[]>(KEYS.students, INITIAL_STUDENTS);
  },
  async saveStudents(students: Student[]) {
    await delay(40, 100);
    writeJson(KEYS.students, students);
  },
  async listRecords() {
    await delay();
    return readJson<AttendanceRecord[]>(KEYS.records, INITIAL_ATTENDANCE_STREAM);
  },
  async saveRecords(records: AttendanceRecord[]) {
    await delay(40, 100);
    writeJson(KEYS.records, records);
  },
  async getSettings() {
    await delay(40, 80);
    return readJson<Settings>(KEYS.settings, DEFAULT_SETTINGS);
  },
  async saveSettings(settings: Settings) {
    await delay(40, 100);
    writeJson(KEYS.settings, settings);
  },
  async getProfile() {
    await delay(40, 80);
    return readJson<UserProfile>(KEYS.profile, DEFAULT_PROFILE);
  },
  async saveProfile(profile: UserProfile) {
    await delay(40, 100);
    writeJson(KEYS.profile, profile);
  },
  async listNotices(): Promise<Notice[]> {
    await delay();
    return MOCK_NOTICES;
  },
};

