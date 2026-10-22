'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Sliders,
  Volume2,
  QrCode,
  Save,
  CheckCircle2,
} from 'lucide-react';

interface EditAccountViewProps {
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export function EditAccountView({
  audioEnabled,
  onToggleAudio,
}: EditAccountViewProps) {
  const [officerName, setOfficerName] = useState('Capt. Roberto M. Sian');
  const [email, setEmail] = useState('r.sian@jblcf-bacolod.edu.ph');
  const [department, setDepartment] = useState('College of Maritime Education');
  const [bufferThreshold, setBufferThreshold] = useState('50');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#0A1C33]">
            Institutional Account & Hardware Configuration
          </h2>
          <p className="text-xs text-slate-500">
            Manage administrative credentials, officer assignment, and USB/Bluetooth HID scanner settings
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Officer Credentials Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User size={16} className="text-[#0E294B]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Officer Profile & Department Authority
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Authorized Officer Name
              </label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Institutional Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Academic Unit / Division
              </label>
              <input
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
              USB & Bluetooth HID Scanner Parameters
            </h3>
          </div>

          <div className="space-y-4 text-xs">
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

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Keystroke Interval Threshold (Milliseconds)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={bufferThreshold}
                  onChange={(e) => setBufferThreshold(e.target.value)}
                  className="w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
                />
                <span className="text-slate-500 text-[11px]">
                  Standard hardware barcode scanners type within 15–50ms. Keys spaced greater than this will be treated as manual typing.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <CheckCircle2 size={16} />
              <span>Configuration successfully saved to local station.</span>
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#0E294B] hover:bg-[#143765] text-white text-xs font-bold tracking-wide shadow-sm transition-colors"
          >
            <Save size={15} className="text-[#DEB033]" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
