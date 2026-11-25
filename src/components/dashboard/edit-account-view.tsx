'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  QrCode,
  Save,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Lock,
  ExternalLink,
  Download,
  Users2,
  FileText,
} from 'lucide-react';
import { Settings } from '@/types/attendance';
import { UserProfile } from '@/lib/api/types';
import { toManilaISO } from '@/lib/time';

interface EditAccountViewProps {
  audioEnabled: boolean;
  onToggleAudio: () => void;
  settings: Settings;
  profile: UserProfile;
  onSaveSettings: (settings: Settings) => Promise<void>;
  onSaveProfile: (profile: UserProfile) => Promise<void>;
  onResetDemoData: () => Promise<void>;
}

export function EditAccountView({
  audioEnabled,
  onToggleAudio,
  settings,
  profile,
  onSaveSettings,
  onSaveProfile,
  onResetDemoData,
}: EditAccountViewProps) {
  const isAdmin = profile.role === 'admin';

  // Track previous prop identity to reset state without useEffect cascading renders
  const [prevProfile, setPrevProfile] = useState(profile);
  const [officerName, setOfficerName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [department, setDepartment] = useState(profile.department);

  if (profile !== prevProfile) {
    setPrevProfile(profile);
    setOfficerName(profile.name);
    setEmail(profile.email);
    setDepartment(profile.department);
  }

  const [prevSettings, setPrevSettings] = useState(settings);
  const [lateCutoff, setLateCutoff] = useState(settings.lateCutoffTime);
  const [bufferThreshold, setBufferThreshold] = useState(
    String(settings.scannerIntervalMs)
  );
  const [cooldownMs, setCooldownMs] = useState(
    String(settings.duplicateCooldownMs)
  );
  const [minBarcode, setMinBarcode] = useState(
    String(settings.minBarcodeLength)
  );
  const [showGenderSplit, setShowGenderSplit] = useState(
    Boolean(settings.showGenderSplit)
  );

  if (settings !== prevSettings) {
    setPrevSettings(settings);
    setLateCutoff(settings.lateCutoffTime);
    setBufferThreshold(String(settings.scannerIntervalMs));
    setCooldownMs(String(settings.duplicateCooldownMs));
    setMinBarcode(String(settings.minBarcodeLength));
    setShowGenderSplit(Boolean(settings.showGenderSplit));
  }

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const intervalNum = parseInt(bufferThreshold, 10);
    const cooldownNum = parseInt(cooldownMs, 10);
    const minNum = parseInt(minBarcode, 10);

    if (isNaN(intervalNum) || intervalNum < 10 || intervalNum > 500) {
      alert('Keystroke interval must be between 10 and 500 ms.');
      setIsSaving(false);
      return;
    }
    if (isNaN(cooldownNum) || cooldownNum < 0 || cooldownNum > 30000) {
      alert('Cooldown must be between 0 and 30,000 ms.');
      setIsSaving(false);
      return;
    }
    if (isNaN(minNum) || minNum < 1 || minNum > 50) {
      alert('Min barcode length must be between 1 and 50.');
      setIsSaving(false);
      return;
    }

    // Derive initials from the name (uppercase first letters of words, skip titles)
    const TITLES = new Set(['Capt.', 'Dr.', 'Prof.', 'Mr.', 'Ms.', 'Mrs.', 'Engr.', 'Atty.']);
    const initials = officerName
      .split(' ')
      .filter((w) => w.length > 0 && !TITLES.has(w))
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');

    await Promise.all([
      onSaveProfile({
        ...profile,
        name: officerName,
        email,
        department,
        initials: initials || profile.initials,
      }),
      onSaveSettings({
        ...settings,
        lateCutoffTime: lateCutoff,
        scannerIntervalMs: intervalNum,
        duplicateCooldownMs: cooldownNum,
        minBarcodeLength: minNum,
        showGenderSplit,
        audioEnabled,
      }),
    ]);

    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = async () => {
    if (!isAdmin) {
      alert('Administrative authorization required. Teachers cannot reset institutional demo data.');
      return;
    }
    if (
      !window.confirm(
        'Reset all demo data? This will clear attendance records and restore defaults.'
      )
    ) {
      return;
    }
    setIsResetting(true);
    await onResetDemoData();
    setIsResetting(false);
  };

  const handleDownloadMyData = () => {
    const exportData = {
      system: 'ChronoAttendis Attendance Tracking & Monitoring System',
      institution: 'John B. Lacson Colleges Foundation - Bacolod',
      exportTimestamp: toManilaISO(new Date()),
      requester: {
        name: profile.name,
        email: profile.email,
        role: profile.role,
        department: profile.department,
      },
      compliance: {
        legalBasis: 'Republic Act 10173 - Data Privacy Act of 2012',
        retentionPolicy: 'Institutional student attendance logs are subject to JBLCF-Bacolod DPO guidelines.',
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chronoattendis-profile-${profile.role}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#0A1C33]">
              Institutional Account &amp; Hardware Configuration
            </h2>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold border ${
                isAdmin
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-blue-50 text-blue-800 border-blue-300'
              }`}
            >
              {isAdmin ? 'System Administrator' : 'Faculty Officer'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage officer profile, scanner timings, institutional privacy controls, and data governance
          </p>
        </div>
      </div>

      {/* Role Notice Banner (R20) */}
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold block text-amber-950 mb-0.5">
              Administrative Access Notice
            </span>
            Only administrators can modify system cutoff times and scanner parameters.
            Contact the lead systems administrator if adjustments are required.
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Officer Credentials Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User size={16} className="text-[#0E294B]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Officer Profile &amp; Department Authority
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck size={14} className="text-[#C99313]" />
              <span>Verified Session Identity</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label
                className="block font-semibold text-slate-700 mb-1"
                htmlFor="ea-name"
              >
                Authorized Officer Name
              </label>
              <input
                id="ea-name"
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
              />
            </div>

            <div>
              <label
                className="block font-semibold text-slate-700 mb-1"
                htmlFor="ea-email"
              >
                Institutional Email Address
              </label>
              <input
                id="ea-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
              />
            </div>

            <div className="md:col-span-2">
              <label
                className="block font-semibold text-slate-700 mb-1"
                htmlFor="ea-dept"
              >
                Academic Unit / Division
              </label>
              <input
                id="ea-dept"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
              />
            </div>
          </div>
        </div>

        {/* Hardware Barcode Scanner Parameters */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <QrCode size={16} className="text-[#0E294B]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                USB &amp; Bluetooth HID Scanner Parameters
              </h3>
            </div>
            {!isAdmin && (
              <span className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                <Lock size={12} />
                Admin Locked
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            {/* Audio toggle */}
            <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">
                  Acoustic Audio Confirmation
                </span>
                <span className="text-[11px] text-slate-500">
                  Emit synchronized high-frequency chime (880Hz/1320Hz) upon verified barcode scan
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleAudio}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  audioEnabled
                    ? 'bg-[#0E294B] text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {audioEnabled ? 'Enabled' : 'Muted'}
              </button>
            </div>

            {/* Late cutoff */}
            <div>
              <label
                className="block font-semibold text-slate-700 mb-1"
                htmlFor="ea-cutoff"
              >
                Late Arrival Cutoff Time (HH:MM, 24-hour)
              </label>
              <input
                id="ea-cutoff"
                type="time"
                value={lateCutoff}
                disabled={!isAdmin}
                onChange={(e) => setLateCutoff(e.target.value)}
                className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B] disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Scans after this time are flagged as LATE. Default: 07:45 Asia/Manila.
              </p>
            </div>

            {/* Keystroke interval */}
            <div>
              <label
                className="block font-semibold text-slate-700 mb-1"
                htmlFor="ea-interval"
              >
                Keystroke Interval Threshold (ms)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="ea-interval"
                  type="number"
                  min={10}
                  max={500}
                  disabled={!isAdmin}
                  value={bufferThreshold}
                  onChange={(e) => setBufferThreshold(e.target.value)}
                  className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B] disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                <span className="text-slate-500 text-[11px]">
                  Standard HID scanners burst within 15–50 ms. Keys spaced beyond this are treated as manual typing.
                </span>
              </div>
            </div>

            {/* Cooldown */}
            <div>
              <label
                className="block font-semibold text-slate-700 mb-1"
                htmlFor="ea-cooldown"
              >
                Duplicate Scan Cooldown (ms)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="ea-cooldown"
                  type="number"
                  min={0}
                  max={30000}
                  disabled={!isAdmin}
                  value={cooldownMs}
                  onChange={(e) => setCooldownMs(e.target.value)}
                  className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B] disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                <span className="text-slate-500 text-[11px]">
                  Same barcode scanned within this window is rejected as a duplicate. Default: 3000.
                </span>
              </div>
            </div>

            {/* Min barcode length */}
            <div>
              <label
                className="block font-semibold text-slate-700 mb-1"
                htmlFor="ea-minlen"
              >
                Minimum Barcode Length (characters)
              </label>
              <input
                id="ea-minlen"
                type="number"
                min={1}
                max={50}
                disabled={!isAdmin}
                value={minBarcode}
                onChange={(e) => setMinBarcode(e.target.value)}
                className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B] disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Display & Metrics Configuration (H6) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Users2 size={16} className="text-[#0E294B]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Display &amp; Demographic Metrics
            </h3>
          </div>

          <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-900 block">
                Gender Demographics Breakdown
              </span>
              <span className="text-[11px] text-slate-500">
                Display male / female headcount splits across attendance summary metric tiles (Default: Off)
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showGenderSplit}
                onChange={(e) => setShowGenderSplit(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0E294B]"></div>
            </label>
          </div>
        </div>

        {/* Institutional Privacy & Governance Controls (R23) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#0E294B]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Data Privacy &amp; Institutional Governance
              </h3>
            </div>
            <Link
              href="/privacy"
              target="_blank"
              className="text-xs font-semibold text-[#0E294B] hover:text-[#C99313] inline-flex items-center gap-1 transition-colors"
            >
              <span>Privacy Policy</span>
              <ExternalLink size={12} />
            </Link>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <p>
              In compliance with the <strong>Philippine Data Privacy Act of 2012 (RA 10173)</strong>, all biometric and student attendance records are securely processed solely for verified institutional presence monitoring at John B. Lacson Colleges Foundation - Bacolod.
            </p>
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-md text-[11px] text-blue-900">
              <strong className="block text-blue-950 mb-0.5">Retention Schedule Notice:</strong>
              Data retention policies are subject to institutional approval by the JBLCF-Bacolod Data Protection Officer (DPO). [CONFIRM: 30-day retention to be confirmed by the school].
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block text-xs">
                  Account Data Archive
                </span>
                <span className="text-[11px] text-slate-500">
                  Export your verified profile metadata and active session logs as JSON
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadMyData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold transition-colors shadow-sm"
              >
                <Download size={13} className="text-[#C99313]" />
                <span>Download My Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <CheckCircle2 size={16} />
              <span>Configuration saved and applied.</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={isResetting || !isAdmin}
              title={isAdmin ? 'Reset demo data' : 'Administrative authorization required'}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw size={13} />
              {isResetting ? 'Resetting…' : 'Reset Demo Data'}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#0E294B] hover:bg-[#143765] text-white text-xs font-bold tracking-wide shadow-sm transition-colors disabled:opacity-50"
            >
              <Save size={15} className="text-[#DEB033]" />
              <span>{isSaving ? 'Saving…' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
