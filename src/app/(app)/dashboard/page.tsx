'use client';

import React, { useState, useCallback } from 'react';
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
import { TeacherFacultyView } from '@/components/dashboard/teacher-faculty-view';
import { StudentsView } from '@/components/dashboard/students-view';
import { NoticeBoardView } from '@/components/dashboard/notice-board-view';
import { EditAccountView } from '@/components/dashboard/edit-account-view';
import { RecordDetailDrawer } from '@/components/dashboard/record-detail-drawer';
import { Toast, ToastTone } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';

import { TODAY_METRICS, PREVIOUS_DAY_METRICS } from '@/lib/mock-data';
import { DailyMetrics, AttendanceRecord, Student } from '@/types/attendance';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { resolveScan } from '@/lib/scan';
import { toManilaISO } from '@/lib/time';
import { useAttendanceStore } from '@/state/attendance-store';

export default function DashboardPage() {
  const store = useAttendanceStore();
  const { state } = store;

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'previous'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  // Notifications and screen-reader live announcement (A6)
  const [activeToast, setActiveToast] = useState<{
    tone: ToastTone;
    title: string;
    message?: string;
    action?: { label: string; onClick: () => void };
  } | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');
  const [highlightedRecordId, setHighlightedRecordId] = useState<string | null>(null);

  // Live metrics — start from TODAY_METRICS base, update on each scan
  const [todayMetrics, setTodayMetrics] = useState<DailyMetrics>(TODAY_METRICS);

  // Handle scanned barcode
  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      const outcome = resolveScan(barcode, {
        students: state.students,
        existingRecords: state.records,
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

        setTodayMetrics((prev) => {
          const nextPresent = prev.presentCount + 1;
          const nextBoysPresent =
            newRecord.gender === 'male' ? prev.boysPresent + 1 : prev.boysPresent;
          const nextGirlsPresent =
            newRecord.gender === 'female'
              ? prev.girlsPresent + 1
              : prev.girlsPresent;
          const nextLate =
            newRecord.status === 'late' ? prev.lateArrivals + 1 : prev.lateArrivals;
          const nextAbsences = Math.max(0, prev.totalAbsences - 1);
          const nextUnexcused = Math.max(0, prev.absentUnexcused - 1);

          return {
            ...prev,
            presentCount: nextPresent,
            presentPercentage: Number(
              ((nextPresent / prev.totalEnrolled) * 100).toFixed(1)
            ),
            boysPresent: nextBoysPresent,
            boysPercentage: Number(
              ((nextBoysPresent / prev.boysTotal) * 100).toFixed(1)
            ),
            girlsPresent: nextGirlsPresent,
            girlsPercentage: Number(
              ((nextGirlsPresent / prev.girlsTotal) * 100).toFixed(1)
            ),
            totalAbsences: nextAbsences,
            absentUnexcused: nextUnexcused,
            lateArrivals: nextLate,
          };
        });

        setActiveToast({
          tone: outcome.type === 'PRESENT' ? 'success' : 'warning',
          title:
            outcome.type === 'PRESENT'
              ? 'Verified Present'
              : 'Flagged Late Arrival',
          message: `${outcome.record.studentName} (${outcome.record.yearSection})`,
        });

        setTimeout(() => {
          setActiveToast((current) =>
            current?.message?.includes(newRecord.studentName) ? null : current
          );
        }, 4500);
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
      } else if (outcome.type === 'NOT_RECOGNIZED') {
        setActiveToast({
          tone: 'error',
          title: 'Barcode Not Recognized',
          message: outcome.message,
          action: {
            label: 'Look Up Student',
            onClick: () => setIsManualModalOpen(true),
          },
        });
      } else if (outcome.type === 'REVOKED_BARCODE') {
        setActiveToast({
          tone: 'error',
          title: 'Revoked Credential',
          message: outcome.message,
          action: {
            label: 'Manual Override',
            onClick: () => setIsManualModalOpen(true),
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
    [state.students, state.records, state.settings.lateCutoffTime, store]
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
    const existing = state.records.find(
      (r) =>
        r.studentId === student.id && !r.voidedAt && r.scanType === 'time-in'
    );
    if (existing) {
      setActiveToast({
        tone: 'warning',
        title: 'Already Recorded',
        message: `${student.fullName} has already been logged present.`,
      });
      playAudioTone('warning');
      return;
    }

    const isoTimestamp = toManilaISO(new Date());
    const newRecordId = `rec-man-${Date.now()}`;
    const newRecord: AttendanceRecord = {
      id: newRecordId,
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

    setTodayMetrics((prev) => {
      const nextPresent = prev.presentCount + 1;
      const nextBoysPresent =
        student.gender === 'male' ? prev.boysPresent + 1 : prev.boysPresent;
      const nextGirlsPresent =
        student.gender === 'female' ? prev.girlsPresent + 1 : prev.girlsPresent;
      const nextLate = status === 'late' ? prev.lateArrivals + 1 : prev.lateArrivals;
      const nextAbsences = Math.max(0, prev.totalAbsences - 1);
      const nextUnexcused = Math.max(0, prev.absentUnexcused - 1);

      return {
        ...prev,
        presentCount: nextPresent,
        presentPercentage: Number(
          ((nextPresent / prev.totalEnrolled) * 100).toFixed(1)
        ),
        boysPresent: nextBoysPresent,
        boysPercentage: Number(
          ((nextBoysPresent / prev.boysTotal) * 100).toFixed(1)
        ),
        girlsPresent: nextGirlsPresent,
        girlsPercentage: Number(
          ((nextGirlsPresent / prev.girlsTotal) * 100).toFixed(1)
        ),
        totalAbsences: nextAbsences,
        absentUnexcused: nextUnexcused,
        lateArrivals: nextLate,
      };
    });

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
    selectedPeriod === 'today' ? todayMetrics : PREVIOUS_DAY_METRICS;

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
        onOpenScannerStation={() => setIsScannerModalOpen(true)}
        userProfile={state.profile}
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
              {/* Section 1: Top Metrics Bar */}
              <MetricsBar
                metrics={activeMetrics}
                selectedPeriod={selectedPeriod}
                onSelectPeriod={setSelectedPeriod}
                previousDayMetrics={PREVIOUS_DAY_METRICS}
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
        onClose={() => setIsManualModalOpen(false)}
        students={state.students}
        onRecordManualAttendance={handleRecordManualAttendance}
      />

      {/* Drawer: Record Detail (D7) */}
      {selectedRecord && (
        <RecordDetailDrawer
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}
