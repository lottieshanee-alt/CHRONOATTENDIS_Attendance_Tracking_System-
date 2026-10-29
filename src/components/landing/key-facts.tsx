import React from 'react';
import { QrCode, LayoutDashboard, FileSpreadsheet, Anchor } from 'lucide-react';

interface KeyFactItem {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  label: string;
  description: string;
}

const FACTS: KeyFactItem[] = [
  {
    icon: QrCode,
    label: 'Barcode-based check-in',
    description: 'Instant student scanning via USB or Bluetooth HID readers',
  },
  {
    icon: LayoutDashboard,
    label: 'Live dashboard',
    description: 'Real-time present, late, and absentee tallies with trends',
  },
  {
    icon: FileSpreadsheet,
    label: 'Roster export (CSV)',
    description: 'One-click departmental attendance sheets for recordkeeping',
  },
  {
    icon: Anchor,
    label: 'Built for JBLCF',
    description: 'Tailored for maritime cadet musters and academic sections',
  },
];

export function KeyFacts() {
  return (
    <section className="border-y border-slate-200 bg-white py-10" aria-label="Key System Capabilities">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {FACTS.map((fact, index) => {
            const Icon = fact.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all duration-120 hover-lift"
              >
                <div className="w-11 h-11 rounded-lg bg-[#0e294b]/5 border border-[#143765]/10 flex items-center justify-center text-[#1b4780] shrink-0">
                  <Icon className="w-5 h-5 text-[#1b4780]" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm text-[#0a1c33] tracking-tight">
                    {fact.label}
                  </span>
                  <span className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {fact.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
