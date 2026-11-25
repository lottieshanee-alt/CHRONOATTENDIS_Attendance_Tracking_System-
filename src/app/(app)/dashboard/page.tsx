'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Sidebar, NavTab } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MetricsBar } from '@/components/dashboard/metrics-bar';
import { AttendanceOverviewChart } from '@/components/dashboard/attendance-overview-chart';
import { ClassDistributionChart } from '@/components/dashboard/class-distribution-chart';
import { CalendarWidget } from '@/components/dashboard/calendar-widget';
import { LiveActivityStream } from '@/components/dashboard/live-activity-stream';
import { ActivityGallery } from '@/components/dashboard/activity-gallery';
import { ScannerStationModal } from '@/components/dashboard/scanner-station-modal';
import { AttendanceRosterModal } from '@/components/dashboard/attendance-roster-modal';
import { ManualAttendanceModal } from '@/components/dashboard/manual-attendance-modal';
import { SessionBanner } from '@/components/dashboard/session-banner';
import { OpenSessionModal } from '@/components/dashboard/open-session-modal';
import { CloseSessionModal } from '@/components/dashboard/close-session-modal';
import { TeacherFacultyView } from '@/components/dashboard/teacher-faculty-view';
import { StudentsView } from '@/components/dashboard/students-view';
import { NoticeBoardView } from '@/components/dashboard/notice-board-view';
import { EditAccountView } from '@/components/dashboard/edit-account-view';
import { RecordDetailDrawer } from '@/components/dashboard/record-detail-drawer';
import { Toast, ToastTone } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';

import { AttendanceRecord, Student } from '@/types/attendance';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { resolveScan } from '@/lib/scan';
import { toManilaISO, getManilaDateKey } from '@/lib/time';
import { computeMetrics } from '@/lib/metrics';
import { useAttendanceStore } from '@/state/attendance-store';
import { logoutAction } from '@/lib/auth/session';

export default function DashboardPage() {
  const store = useAttendanceStore();
  const { state } = store;

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'previous'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  // Manila "today" dateKey — computed client-side after mount to avoid N8 hydration mismatch
  const isMounted = useIsMounted();
  const todayKey = isMounted ? getManilaDateKey(new Date()) : '';

  // Modals
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isOpenSessionModalOpen, setIsOpenSessionModalOpen] = useState(false);
  const [isCloseSessionModalOpen, setIsCloseSessionModalOpen] = useState(false);
  const [manualModalInitialQuery, setManualModalInitialQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  // Available class sections from active student directory
  const availableSections = useMemo(() => {
    const set = new Set<string>();
    for (const s of state.students) {
      if (s.yearSection) set.add(s.yearSection);
    }
    return Array.from(set).sort();
  }, [state.students]);

  // Notifications and screen-reader live announcement (A6)
  const [activeToast, setActiveToast] = useState<{
    tone: ToastTone;
    title: string;
    message?: string;
    action?: { label: string; onClick: () => void };
  } | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');
  const [highlightedRecordId, setHighlightedRecordId] = useState<string | null>(null);

  // Derive metrics from actual records (N3 fix) — no more hard-coded constants at runtime.
  // todayKey is '' on first SSR frame → computeMetrics returns zeroed object; that's fine,
  // the hydration skeleton hides the page until state.hydrated is true.
  const previousDayKey = useMemo(() => {
    if (!todayKey) return '';
    const d = new Date(`${todayKey}T12:00:00+08:00`);
    d.setDate(d.getDate() - 1);
    return getManilaDateKey(d);
  }, [todayKey]);

  const todayMetrics = useMemo(
    () =>
      todayKey
        ? computeMetrics(state.records, state.students, todayKey)
        : computeMetrics([], [], ''),
    [state.records, state.students, todayKey]
  );

  const previousDayMetrics = useMemo(
    () =>
      previousDayKey
        ? computeMetrics(state.records, state.students, previousDayKey)
        : computeMetrics([], [], ''),
    [state.records, state.students, previousDayKey]
  );

  // Handle scanned barcode
  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      const outcome = resolveScan(barcode, {
        students: state.students,
        existingRecords: state.records,
        session: state.activeSession,
        lateCutoffTime: state.settings.lateCutoffTime,
        now: new Date(),
        scannerLocation: 'Gate 1 - Main Turnstile',
      });

      setLiveAnnouncement(outcome.message);

      if (outcome.type === 'PRESENT' || outcome.type === 'LATE') {
        if (!outcome.record) return;

        const newRecord = outcome.record;
        store.addRecord(newRecord);
        setHighlightedRecordId(newRecord.id);

        // Metrics are now derived from state.records (N3 fix) — no manual counter updates needed.

        // Undo action available for 10 seconds (R7)
        setActiveToast({
          tone: outcome.type === 'PRESENT' ? 'success' : 'warning',
          title:
            outcome.type === 'PRESENT'
              ? 'Verified Present'
              : 'Flagged Late Arrival',
          message: `${outcome.record.studentName} (${outcome.record.yearSection})`,
          action: {
            label: 'Undo',
            onClick: () => {
              store.voidRecord(newRecord.id, 'Scanned by mistake (Undo)');
              setActiveToast({
                tone: 'warning',
                title: 'Scan Undone',
                message: `Voided check-in record for ${newRecord.studentName}.`,
              });
            },
          },
        });

        setTimeout(() => {
          setActiveToast((current) =>
            current?.message?.includes(newRecord.studentName) ? null : current
          );
        }, 10000); // 10 seconds undo duration (R7)
      } else if (outcome.type === 'ALREADY_CHECKED_IN') {
        setActiveToast({
          tone: 'warning',
          title: 'Duplicate Scan Rejected',
          message: outcome.message,
        });
        setTimeout(() => {
          setActiveToast((current) =>
            current?.title === 'Duplicate Scan Rejected' ? null : current
          );
        }, 4000);
      } else if (outcome.type === 'NOT_ENROLLED') {
        setActiveToast({
          tone: 'warning',
          title: 'Not Enrolled in Section',
          message: outcome.message,
          action: {
            label: 'Manual Override',
            onClick: () => {
              setManualModalInitialQuery(barcode);
              setIsManualModalOpen(true);
            },
          },
        });
      } else if (outcome.type === 'SESSION_CLOSED') {
        setActiveToast({
          tone: 'warning',
          title: 'Session Closed',
          message: outcome.message,
          action: {
            label: 'Open Session',
            onClick: () => setIsOpenSessionModalOpen(true),
          },
        });
      } else if (outcome.type === 'NOT_RECOGNIZED') {
        setActiveToast({
          tone: 'error',
          title: 'Barcode Not Recognized',
          message: outcome.message,
          action: {
            label: 'Look Up Student',
            onClick: () => {
              setManualModalInitialQuery(barcode);
              setIsManualModalOpen(true);
            },
          },
        });
      } else if (outcome.type === 'REVOKED_BARCODE') {
        setActiveToast({
          tone: 'error',
          title: 'Revoked Credential',
          message: outcome.message,
          action: {
            label: 'Manual Override',
            onClick: () => {
              setManualModalInitialQuery(barcode);
              setIsManualModalOpen(true);
            },
          },
        });
      } else {
        setActiveToast({
          tone: outcome.tone,
          title: 'Scan Notice',
          message: outcome.message,
        });
      }
    },
    [state.students, state.records, state.activeSession, state.settings.lateCutoffTime, store]
  );

  // Initialize hardware USB/Bluetooth barcode scanner hook with live settings (D6)
  const {
    isScannerReady,
    lastScanned,
    lastScanTime,
    audioEnabled,
    setAudioEnabled,
    playAudioTone,
    triggerScan,
    diagnostics,
  } = useBarcodeScanner({
    onScan: handleBarcodeScan,
    minChars: state.settings.minBarcodeLength,
    maxIntervalMs: state.settings.scannerIntervalMs,
    cooldownMs: state.settings.duplicateCooldownMs,
    audioEnabled: state.settings.audioEnabled,
    onCooldownHit: (barcode, remainingMs) => {
      const msg = `Scan cooldown: ${barcode} was scanned within the last ${Math.ceil(
        state.settings.duplicateCooldownMs / 1000
      )}s (${Math.ceil(remainingMs / 1000)}s remaining)`;
      setLiveAnnouncement(msg);
      setActiveToast({
        tone: 'warning',
        title: 'Scanner Cooldown',
        message: msg,
      });
      setTimeout(() => {
        setActiveToast((current) =>
          current?.title === 'Scanner Cooldown' ? null : current
        );
      }, 2500);
    },
    onF9Shortcut: () => {
      setIsScannerModalOpen((prev) => !prev);
    },
  });

  // Handle manual attendance override (Item 3)
  const handleRecordManualAttendance = (
    student: Student,
    status: 'present' | 'late',
    reason: string,
    notes?: string
  ) => {
    // Scope duplicate check to today's Manila date (N2 fix)
    const existing = state.records.find(
      (r) =>
        r.studentId === student.id &&
        !r.voidedAt &&
        r.scanType === 'time-in' &&
        getManilaDateKey(r.timestamp) === todayKey
    );
    if (existing) {
      setActiveToast({
        tone: 'warning',
        title: 'Already Recorded',
        message: `${student.fullName} has already been logged present today.`,
      });
      playAudioTone('warning');
      return;
    }

    const isoTimestamp = toManilaISO(new Date());
    const newRecordId = `rec-man-${Date.now()}`;
    const newRecord: AttendanceRecord = {
      id: newRecordId,
      sessionId: state.activeSession?.id,
      studentId: student.id,
      studentName: student.fullName,
      studentNumber: student.studentNumber,
      yearSection: student.yearSection,
      department: student.department,
      gender: student.gender,
      scanType: 'time-in',
      timestamp: isoTimestamp,
      scannerLocation: 'Admin Station - Manual Override',
      status,
      verificationMethod: 'MANUAL_OVERRIDE',
      manualReason: notes ? `${reason} (Notes: ${notes})` : reason,
    };

    store.addRecord(newRecord);
    setHighlightedRecordId(newRecordId);

    // Metrics are now derived from state.records (N3 fix) — no manual counter updates needed.

    playAudioTone(status === 'present' ? 'success' : 'warning');
    const msg = `Manual Override: Verified ${student.fullName} as ${status.toUpperCase()} (${reason})`;
    setLiveAnnouncement(msg);
    setActiveToast({
      tone: 'success',
      title: 'Manual Attendance Recorded',
      message: `${student.fullName} (${student.yearSection}) — ${reason}`,
    });
  };

  const activeMetrics =
    selectedPeriod === 'today' ? todayMetrics : previousDayMetrics;

  const unreadNoticesCount = useMemo(
    () => state.notices.filter((n) => !n.readAt).length,
    [state.notices]
  );

  // Loading skeleton while hydrating from localStorage (B5)
  if (!state.hydrated) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans items-center justify-center">
        <div className="space-y-4 p-8 w-full max-w-sm">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Polite aria-live region for screen-reader announcements (A6) */}
      <div role="status" aria-live="polite" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Institutional Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        scannerConnected={isScannerReady}
        lastScanTime={lastScanTime}
        onOpenScannerStation={() => setIsScannerModalOpen(true)}
        userProfile={state.profile}
        unreadNoticesCount={unreadNoticesCount}
        onSignOut={() => {
          logoutAction();
        }}
        mobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Operational Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Institutional Header */}
        <Header
          scannerReady={isScannerReady}
          audioEnabled={audioEnabled}
          onToggleAudio={() => setAudioEnabled(!audioEnabled)}
          onOpenScannerStation={() => setIsScannerModalOpen(true)}
          onOpenExportDialog={() => setIsRosterModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Live Notification Toast Banner */}
        {activeToast && (
          <Toast
            tone={activeToast.tone}
            title={activeToast.title}
            message={activeToast.message}
            action={activeToast.action}
            onDismiss={() => setActiveToast(null)}
          />
        )}

        {/* Body Scroll View */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentTab === 'dashboard' && (
            <>
              {/* Section 0: Attendance Session Control & Call-to-action (R1) */}
              <SessionBanner
                activeSession={state.activeSession}
                students={state.students}
                records={state.records}
                onOpenNewSession={() => setIsOpenSessionModalOpen(true)}
                onOpenScanner={() => setIsScannerModalOpen(true)}
                onRequestCloseSession={() => setIsCloseSessionModalOpen(true)}
              />

              {/* Section 1: Top Metrics Bar */}
              <MetricsBar
                metrics={activeMetrics}
                selectedPeriod={selectedPeriod}
                onSelectPeriod={setSelectedPeriod}
                previousDayMetrics={previousDayMetrics}
                showGenderSplit={state.settings.showGenderSplit}
              />

              {/* Section 2: Analytics & Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AttendanceOverviewChart />
                <ClassDistributionChart />
              </div>

              {/* Section 3: Calendar & Live Activity Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Live Activity Stream — wired to searchQuery (D1) */}
                <div className="lg:col-span-7">
                  <LiveActivityStream
                    records={state.records}
                    highlightedId={highlightedRecordId}
                    searchQuery={searchQuery}
                    onOpenRecordDetail={(rec) => setSelectedRecord(rec)}
                  />
                </div>

                {/* Academic Calendar with real navigation (D2) */}
                <div className="lg:col-span-5">
                  <CalendarWidget />
                </div>
              </div>

              {/* Section 4: Institutional Activity Gallery */}
              <ActivityGallery />
            </>
          )}

          {currentTab === 'teacher' && <TeacherFacultyView />}

          {currentTab === 'student' && (
            <StudentsView onSimulateScan={triggerScan} />
          )}

          {currentTab === 'notices' && <NoticeBoardView />}

          {currentTab === 'account' && (
            <EditAccountView
              audioEnabled={audioEnabled}
              onToggleAudio={() => setAudioEnabled(!audioEnabled)}
              settings={state.settings}
              profile={state.profile}
              onSaveSettings={store.saveSettings}
              onSaveProfile={store.saveProfile}
              onResetDemoData={store.resetDemoData}
            />
          )}
        </main>
      </div>

      {/* Modal 1: Hardware Barcode Scanner Station */}
      <ScannerStationModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onSimulateScan={triggerScan}
        onOpenManualModal={() => setIsManualModalOpen(true)}
        lastScannedBarcode={lastScanned}
        lastScannedTime={lastScanTime}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
        diagnostics={diagnostics}
      />

      {/* Modal 2: TanStack Table Institutional Roster */}
      <AttendanceRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        data={state.records}
      />

      {/* Modal 3: Manual Attendance Fallback */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setManualModalInitialQuery('');
        }}
        initialQuery={manualModalInitialQuery}
        students={state.students}
        onRecordManualAttendance={handleRecordManualAttendance}
      />

      {/* Modal 4: Open New Attendance Session (R1) */}
      <OpenSessionModal
        isOpen={isOpenSessionModalOpen}
        onClose={() => setIsOpenSessionModalOpen(false)}
        defaultCutoffTime={state.settings.lateCutoffTime}
        sections={availableSections}
        onOpenSession={async (params) => {
          const newSession = await store.openSession(params);
          setActiveToast({
            tone: 'success',
            title: 'Attendance Session Opened',
            message: `${newSession.subject} (${newSession.section}) — Ready for scans.`,
          });
        }}
      />

      {/* Modal 5: Close Attendance Session (R1, R3) */}
      <CloseSessionModal
        isOpen={isCloseSessionModalOpen}
        onClose={() => setIsCloseSessionModalOpen(false)}
        session={state.activeSession}
        students={state.students}
        records={state.records}
        onConfirmClose={async (sessionId) => {
          const { session, absentRecords } = await store.closeSession(sessionId);
          setActiveToast({
            tone: 'info',
            title: 'Session Finalized',
            message: `Closed "${session.subject}". Marked ${absentRecords.length} unverified cadets as absent.`,
          });
        }}
      />

      {/* Drawer: Record Detail with Void Action (D7, R5) */}
      {selectedRecord && (
        <RecordDetailDrawer
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onVoidRecord={async (recordId, reason) => {
            await store.voidRecord(recordId, reason);
            setActiveToast({
              tone: 'warning',
              title: 'Record Voided',
              message: `Official record ${recordId} was voided with audit logging.`,
            });
            setSelectedRecord(null);
          }}
        />
      )}
    </div>
  );
}
