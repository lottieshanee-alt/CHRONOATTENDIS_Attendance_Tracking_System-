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
  Session,
  AuditEntry,
  DEFAULT_SETTINGS,
} from '@/types/attendance';
import { api } from '@/lib/api';
import { UserProfile, DEFAULT_PROFILE } from '@/lib/api/types';
import { SessionData } from '@/lib/auth/constants';
import { createSession, deriveAbsences, voidRecord as pureVoidRecord } from '@/lib/session';
import { toManilaISO } from '@/lib/time';

// ─── State shape ─────────────────────────────────────────────────────────────

interface StoreState {
  students: Student[];
  records: AttendanceRecord[];
  sessions: Session[];
  activeSession: Session | null;
  auditEntries: AuditEntry[];
  settings: Settings;
  profile: UserProfile;
  notices: Notice[];
  hydrated: boolean;
}

const INITIAL: StoreState = {
  students: [],
  records: [],
  sessions: [],
  activeSession: null,
  auditEntries: [],
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
  | { type: 'SET_SESSIONS'; payload: Session[] }
  | { type: 'SET_ACTIVE_SESSION'; payload: Session | null }
  | { type: 'SET_AUDIT_ENTRIES'; payload: AuditEntry[] }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'SET_NOTICES'; payload: Notice[] };

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
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSession: action.payload };
    case 'SET_AUDIT_ENTRIES':
      return { ...state, auditEntries: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_NOTICES':
      return { ...state, notices: action.payload };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

export interface OpenSessionParams {
  subject: string;
  section: string;
  lateCutoffTime?: string;
}

interface StoreContextValue {
  state: StoreState;
  addRecord: (record: AttendanceRecord) => void;
  saveRecords: (records: AttendanceRecord[]) => void;
  openSession: (params: OpenSessionParams) => Promise<Session>;
  closeSession: (sessionId: string) => Promise<{ session: Session; absentRecords: AttendanceRecord[] }>;
  voidRecord: (recordId: string, reason: string) => Promise<void>;
  saveSettings: (settings: Settings) => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  saveStudents: (students: Student[]) => Promise<void>;
  saveNotices: (notices: Notice[]) => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AttendanceStoreProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession?: SessionData | null;
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
      const [students, records, sessions, auditEntries, settings, storedProfile, notices] = await Promise.all([
        api.listStudents(),
        api.listRecords(),
        api.listSessions(),
        api.listAuditEntries(),
        api.getSettings(),
        api.getProfile(),
        api.listNotices(),
      ]);

      // Active session is the first session without closedAt
      const active = sessions.find((s) => !s.closedAt) || null;

      // Integrate verified server session identity into user profile (N4, R20)
      const profile: UserProfile = {
        ...storedProfile,
        ...(initialSession
          ? {
              name: initialSession.name || storedProfile.name,
              email: initialSession.email || storedProfile.email,
              role: initialSession.role || storedProfile.role,
              department: initialSession.department || storedProfile.department,
            }
          : {}),
      };

      dispatch({
        type: 'HYDRATE',
        payload: {
          students,
          records,
          sessions,
          activeSession: active,
          auditEntries,
          settings,
          profile,
          notices,
        },
      });
    }
    hydrate();
  }, [initialSession]);

  const addRecord = useCallback((record: AttendanceRecord) => {
    dispatch({ type: 'ADD_RECORD', payload: record });
    if (pendingRecordSave.current) clearTimeout(pendingRecordSave.current);
    pendingRecordSave.current = setTimeout(() => {
      const existing = recordsRef.current.filter((r) => r.id !== record.id);
      api.saveRecords([record, ...existing]);
    }, 400);
  }, []);

  const saveRecords = useCallback((records: AttendanceRecord[]) => {
    dispatch({ type: 'SET_RECORDS', payload: records });
    api.saveRecords(records);
  }, []);

  const openSession = useCallback(
    async (params: OpenSessionParams): Promise<Session> => {
      const lateCutoff = params.lateCutoffTime || state.settings.lateCutoffTime;
      const newSession = createSession({
        subject: params.subject,
        section: params.section,
        lateCutoffTime: lateCutoff,
        openedBy: state.profile.name || 'Capt. Roberto M. Sian',
      });

      const updatedSessions = [newSession, ...state.sessions];
      dispatch({ type: 'SET_SESSIONS', payload: updatedSessions });
      dispatch({ type: 'SET_ACTIVE_SESSION', payload: newSession });
      await api.saveSessions(updatedSessions);
      return newSession;
    },
    [state.settings.lateCutoffTime, state.profile.name, state.sessions]
  );

  const closeSession = useCallback(
    async (sessionId: string) => {
      const sessionIndex = state.sessions.findIndex((s) => s.id === sessionId);
      const targetSession = sessionIndex >= 0 ? state.sessions[sessionIndex] : state.activeSession;

      if (!targetSession) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const closedSession: Session = {
        ...targetSession,
        closedAt: toManilaISO(new Date()),
      };

      const updatedSessions = state.sessions.map((s) =>
        s.id === sessionId ? closedSession : s
      );

      // Derive absences for all enrolled students who have no check-in (R3)
      const absentRecords = deriveAbsences(
        closedSession,
        state.students,
        state.records,
        closedSession.closedAt
      );

      const updatedRecords = [...absentRecords, ...state.records];

      dispatch({ type: 'SET_SESSIONS', payload: updatedSessions });
      if (state.activeSession?.id === sessionId) {
        dispatch({ type: 'SET_ACTIVE_SESSION', payload: null });
      }
      dispatch({ type: 'SET_RECORDS', payload: updatedRecords });

      await Promise.all([
        api.saveSessions(updatedSessions),
        api.saveRecords(updatedRecords),
      ]);

      return { session: closedSession, absentRecords };
    },
    [state.sessions, state.activeSession, state.students, state.records]
  );

  const voidRecord = useCallback(
    async (recordId: string, reason: string) => {
      const record = state.records.find((r) => r.id === recordId);
      if (!record) return;

      const { updatedRecord, auditEntry } = pureVoidRecord(
        record,
        state.profile.name || 'Capt. Roberto M. Sian',
        reason
      );

      const updatedRecords = state.records.map((r) =>
        r.id === recordId ? updatedRecord : r
      );
      const updatedAudit = [auditEntry, ...state.auditEntries];

      dispatch({ type: 'SET_RECORDS', payload: updatedRecords });
      dispatch({ type: 'SET_AUDIT_ENTRIES', payload: updatedAudit });

      await Promise.all([
        api.saveRecords(updatedRecords),
        api.saveAuditEntries(updatedAudit),
      ]);
    },
    [state.records, state.auditEntries, state.profile.name]
  );

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

  const saveNotices = useCallback(async (notices: Notice[]) => {
    dispatch({ type: 'SET_NOTICES', payload: notices });
    await api.saveNotices(notices);
  }, []);

  const resetDemoData = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chrono_students');
      localStorage.removeItem('chrono_records');
      localStorage.removeItem('chrono_settings');
      localStorage.removeItem('chrono_profile');
      localStorage.removeItem('chrono_sessions');
      localStorage.removeItem('chrono_audit');
      localStorage.removeItem('chrono_notices');
    }
    const [students, records, sessions, auditEntries, settings, profile, notices] = await Promise.all([
      api.listStudents(),
      api.listRecords(),
      api.listSessions(),
      api.listAuditEntries(),
      api.getSettings(),
      api.getProfile(),
      api.listNotices(),
    ]);
    dispatch({
      type: 'HYDRATE',
      payload: {
        students,
        records,
        sessions,
        activeSession: null,
        auditEntries,
        settings,
        profile,
        notices,
      },
    });
  }, []);

  const value: StoreContextValue = {
    state,
    addRecord,
    saveRecords,
    openSession,
    closeSession,
    voidRecord,
    saveSettings,
    saveProfile,
    saveStudents,
    saveNotices,
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
