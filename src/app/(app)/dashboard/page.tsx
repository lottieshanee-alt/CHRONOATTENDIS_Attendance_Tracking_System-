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
import { TeacherFacultyView } from '@/components/dashboard/teacher-faculty-view';
import { StudentsView } from '@/components/dashboard/students-view';
import { NoticeBoardView } from '@/components/dashboard/notice-board-view';
import { EditAccountView } from '@/components/dashboard/edit-account-view';

import {
  TODAY_METRICS,
  PREVIOUS_DAY_METRICS,
  INITIAL_ATTENDANCE_STREAM,
  INITIAL_STUDENTS,
} from '@/lib/mock-data';
import { DailyMetrics, AttendanceRecord } from '@/types/attendance';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { CheckCircle2, AlertCircle, X, QrCode } from 'lucide-react';
import { formatTime } from '@/lib/utils';

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'previous'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);

  // Live Attendance Data & Dynamic Metrics State
  const [todayMetrics, setTodayMetrics] = useState<DailyMetrics>(TODAY_METRICS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(
    INITIAL_ATTENDANCE_STREAM
  );
  const [recentNotification, setRecentNotification] = useState<{
    studentName: string;
    studentNumber: string;
    section: string;
    status: 'present' | 'late';
  } | null>(null);
  const [highlightedRecordId, setHighlightedRecordId] = useState<string | null>(null);

  // Handle scanned barcode (from physical USB/BT scanner or manual simulation)
  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      const matched = INITIAL_STUDENTS.find(
        (s) => s.barcode === barcode || s.studentNumber.toLowerCase() === barcode.toLowerCase()
      );

      const studentName = matched ? matched.fullName : `Cadet ID #${barcode.slice(-4)}`;
      const studentNumber = matched ? matched.studentNumber : `JBLCF-2024-${barcode.slice(-4)}`;
      const section = matched ? matched.yearSection : 'BSMT 1-General';
      const department = matched ? matched.department : 'College of Maritime Education';
      const gender = matched ? matched.gender : 'male';

      const now = new Date();
      const formattedTimestamp = formatTime(now);

      // Regimental muster cutoff logic: past 07:45 is marked late
      const isLateArrival = now.getHours() > 7 || (now.getHours() === 7 && now.getMinutes() >= 45);
      const status = isLateArrival ? 'late' : 'present';

      const newRecordId = `rec-${Date.now()}`;
      const newRecord: AttendanceRecord = {
        id: newRecordId,
        studentId: matched?.id || `s-temp-${Date.now()}`,
        studentName,
        studentNumber,
        yearSection: section,
        department,
        gender,
        scanType: 'time-in',
        timestamp: formattedTimestamp,
        scannerLocation: 'Gate 1 - Main Turnstile',
        status,
        verificationMethod: 'BARCODE_HID',
      };

      // Prepend to attendance stream
      setAttendanceRecords((prev) => [newRecord, ...prev]);
      setHighlightedRecordId(newRecordId);

      // Increment live metric counter
      setTodayMetrics((prev) => {
        const nextPresent = prev.presentCount + 1;
        const nextBoysPresent = gender === 'male' ? prev.boysPresent + 1 : prev.boysPresent;
        const nextGirlsPresent = gender === 'female' ? prev.girlsPresent + 1 : prev.girlsPresent;
        const nextLate = status === 'late' ? prev.lateArrivals + 1 : prev.lateArrivals;
        const nextAbsences = Math.max(0, prev.totalAbsences - 1);
        const nextUnexcused = Math.max(0, prev.absentUnexcused - 1);

        return {
          ...prev,
          presentCount: nextPresent,
          presentPercentage: Number(((nextPresent / prev.totalEnrolled) * 100).toFixed(1)),
          boysPresent: nextBoysPresent,
          boysPercentage: Number(((nextBoysPresent / prev.boysTotal) * 100).toFixed(1)),
          girlsPresent: nextGirlsPresent,
          girlsPercentage: Number(((nextGirlsPresent / prev.girlsTotal) * 100).toFixed(1)),
          totalAbsences: nextAbsences,
          absentUnexcused: nextUnexcused,
          lateArrivals: nextLate,
        };
      });

      // Show instant notification pill
      setRecentNotification({
        studentName,
        studentNumber,
        section,
        status,
      });

      // Clear notification after 4 seconds
      setTimeout(() => {
        setRecentNotification((current) =>
          current?.studentNumber === studentNumber ? null : current
        );
      }, 4000);
    },
    []
  );

  // Initialize hardware USB/Bluetooth barcode scanner hook
  const {
    isScannerReady,
    lastScanned,
    lastScanTime,
    audioEnabled,
    setAudioEnabled,
    triggerScan,
  } = useBarcodeScanner({
    onScan: handleBarcodeScan,
    enableAudioFeedback: true,
  });

  const activeMetrics = selectedPeriod === 'today' ? todayMetrics : PREVIOUS_DAY_METRICS;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Institutional Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        scannerConnected={isScannerReady}
        onOpenScannerStation={() => setIsScannerModalOpen(true)}
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

        {/* Live Scan Notification Toast Banner */}
        {recentNotification && (
          <div className="bg-[#0A1C33] text-white px-6 py-2.5 border-b border-[#C99313] flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 status-indicator-live" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#DEB033]">
                  {recentNotification.studentName}
                </span>
                <span className="font-mono text-slate-300">
                  ({recentNotification.studentNumber})
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-200">
                  {recentNotification.section}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-bold text-emerald-400 uppercase text-[10px] bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                  {recentNotification.status === 'present' ? 'Verified Present' : 'Flagged Late'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRecentNotification(null)}
              className="text-slate-400 hover:text-white"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Body Scroll View */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentTab === 'dashboard' && (
            <>
              {/* Section 1: Top Metrics Bar with Tab-Switching */}
              <MetricsBar
                metrics={activeMetrics}
                selectedPeriod={selectedPeriod}
                onSelectPeriod={setSelectedPeriod}
                previousDayMetrics={PREVIOUS_DAY_METRICS}
              />

              {/* Section 2: Analytics & Trends (Two-Column Strict 8pt Grid) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AttendanceOverviewChart />
                <ClassDistributionChart />
              </div>

              {/* Section 3: Calendar & Live Activity Stream Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Live Activity Stream (7 cols on lg) */}
                <div className="lg:col-span-7">
                  <LiveActivityStream
                    records={attendanceRecords}
                    highlightedId={highlightedRecordId}
                  />
                </div>

                {/* Academic Calendar Grid (5 cols on lg) */}
                <div className="lg:col-span-5">
                  <CalendarWidget />
                </div>
              </div>

              {/* Section 4: Institutional Activity Gallery & Regimental Directives */}
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
            />
          )}
        </main>
      </div>

      {/* Modal 1: Hardware Barcode Scanner Station & Simulator */}
      <ScannerStationModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onSimulateScan={triggerScan}
        lastScannedBarcode={lastScanned}
        lastScannedTime={lastScanTime}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
      />

      {/* Modal 2: TanStack Table v8 Institutional Roster */}
      <AttendanceRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        data={attendanceRecords}
      />
    </div>
  );
}
