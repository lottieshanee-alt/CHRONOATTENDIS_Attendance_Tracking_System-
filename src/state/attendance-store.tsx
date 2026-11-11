'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  Student,
  AttendanceRecord,
  Settings,
  Notice,
  DEFAULT_SETTINGS,
} from '@/types/attendance';
import { api } from '@/lib/api';
import { UserProfile, DEFAULT_PROFILE } from '@/lib/api/types';

// ─── State shape ─────────────────────────────────────────────────────────────

interface StoreState {
  students: Student[];
  records: AttendanceRecord[];
  settings: Settings;
  profile: UserProfile;
  notices: Notice[];
  hydrated: boolean;
}

const INITIAL: StoreState = {
  students: [],
  records: [],
  settings: DEFAULT_SETTINGS,
  profile: DEFAULT_PROFILE,
  notices: [],
  hydrated: false,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'HYDRATE'; payload: Omit<StoreState, 'hydrated'> }
  | { type: 'SET_STUDENTS'; payload: Student[] }
  | { type: 'SET_RECORDS'; payload: AttendanceRecord[] }
  | { type: 'ADD_RECORD'; payload: AttendanceRecord }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'SET_PROFILE'; payload: UserProfile };

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, hydrated: true };
    case 'SET_STUDENTS':
      return { ...state, students: action.payload };
    case 'SET_RECORDS':
      return { ...state, records: action.payload };
    case 'ADD_RECORD':
      return { ...state, records: [action.payload, ...state.records] };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface StoreContextValue {
  state: StoreState;
  addRecord: (record: AttendanceRecord) => void;
  saveRecords: (records: AttendanceRecord[]) => void;
  saveSettings: (settings: Settings) => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  saveStudents: (students: Student[]) => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AttendanceStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // Keep a ref to current records so the debounced save can read latest without
  // capturing stale closure values.
  const recordsRef = useRef<AttendanceRecord[]>([]);
  const pendingRecordSave = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    recordsRef.current = state.records;
  }, [state.records]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    async function hydrate() {
      const [students, records, settings, profile, notices] = await Promise.all([
        api.listStudents(),
        api.listRecords(),
        api.getSettings(),
        api.getProfile(),
        api.listNotices(),
      ]);
      dispatch({
        type: 'HYDRATE',
        payload: { students, records, settings, profile, notices },
      });
    }
    hydrate();
  }, []);

  const addRecord = useCallback((record: AttendanceRecord) => {
    dispatch({ type: 'ADD_RECORD', payload: record });
    // Debounce persist — saves 400 ms after the last addRecord call
    if (pendingRecordSave.current) clearTimeout(pendingRecordSave.current);
    pendingRecordSave.current = setTimeout(() => {
      // recordsRef will be updated by the effect above before the timeout fires
      api.saveRecords([record, ...recordsRef.current]);
    }, 400);
  }, []);

  const saveRecords = useCallback((records: AttendanceRecord[]) => {
    dispatch({ type: 'SET_RECORDS', payload: records });
    api.saveRecords(records);
  }, []);

  const saveSettings = useCallback(async (settings: Settings) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings });
    await api.saveSettings(settings);
  }, []);

  const saveProfile = useCallback(async (profile: UserProfile) => {
    dispatch({ type: 'SET_PROFILE', payload: profile });
    await api.saveProfile(profile);
  }, []);

  const saveStudents = useCallback(async (students: Student[]) => {
    dispatch({ type: 'SET_STUDENTS', payload: students });
    await api.saveStudents(students);
  }, []);

  const resetDemoData = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chrono_students');
      localStorage.removeItem('chrono_records');
      localStorage.removeItem('chrono_settings');
      localStorage.removeItem('chrono_profile');
    }
    const [students, records, settings, profile, notices] = await Promise.all([
      api.listStudents(),
      api.listRecords(),
      api.getSettings(),
      api.getProfile(),
      api.listNotices(),
    ]);
    dispatch({
      type: 'HYDRATE',
      payload: { students, records, settings, profile, notices },
    });
  }, []);

  const value: StoreContextValue = {
    state,
    addRecord,
    saveRecords,
    saveSettings,
    saveProfile,
    saveStudents,
    resetDemoData,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAttendanceStore() {
  const ctx = useContext(StoreContext);
  if (!ctx)
    throw new Error(
      'useAttendanceStore must be used inside AttendanceStoreProvider'
    );
  return ctx;
}

