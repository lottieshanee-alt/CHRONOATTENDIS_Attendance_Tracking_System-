'use client';

import React, { useState } from 'react';
import {
  User,
  QrCode,
  Save,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { Settings } from '@/types/attendance';
import { UserProfile } from '@/lib/api/types';

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

  if (settings !== prevSettings) {
    setPrevSettings(settings);
    setLateCutoff(settings.lateCutoffTime);
    setBufferThreshold(String(settings.scannerIntervalMs));
    setCooldownMs(String(settings.duplicateCooldownMs));
    setMinBarcode(String(settings.minBarcodeLength));
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
        audioEnabled,
      }),
    ]);

    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        'Reset all demo data? This will clear attendance records and restore defaults.'
      )
    )
      return;
    setIsResetting(true);
    await onResetDemoData();
    setIsResetting(false);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#0A1C33]">
            Institutional Account &amp; Hardware Configuration
          </h2>
          <p className="text-xs text-slate-500">
            Manage administrative credentials, officer assignment, and
            USB/Bluetooth HID scanner settings
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Officer Credentials Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User size={16} className="text-[#0E294B]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Officer Profile &amp; Department Authority
            </h3>
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
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <QrCode size={16} className="text-[#0E294B]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              USB &amp; Bluetooth HID Scanner Parameters
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Audio toggle */}
            <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">
                  Acoustic Audio Confirmation
                </span>
                <span className="text-[11px] text-slate-500">
                  Emit synchronized high-frequency chime (880Hz/1320Hz) upon
                  verified barcode scan
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleAudio}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${audioEnabled
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
                onChange={(e) => setLateCutoff(e.target.value)}
                className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Scans after this time are flagged as LATE. Default: 07:45.
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
                  value={bufferThreshold}
                  onChange={(e) => setBufferThreshold(e.target.value)}
                  className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
                />
                <span className="text-slate-500 text-[11px]">
                  Standard HID scanners burst within 15–50 ms. Keys spaced
                  beyond this are treated as manual typing.
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
                  value={cooldownMs}
                  onChange={(e) => setCooldownMs(e.target.value)}
                  className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
                />
                <span className="text-slate-500 text-[11px]">
                  Same barcode scanned within this window is rejected as a
                  duplicate. Default: 3000.
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
                value={minBarcode}
                onChange={(e) => setMinBarcode(e.target.value)}
                className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
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
              disabled={isResetting}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors disabled:opacity-50"
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
