import React from 'react';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';

interface LedgerItem {
  term: string;
  description: string;
  category: string;
}

const LEDGER_ITEMS: LedgerItem[] = [
  {
    term: 'HID Barcode Check-In',
    description: 'Keystroke-based check-in via USB or Bluetooth barcode hardware with immediate auditory confirmation.',
    category: 'Hardware',
  },
  {
    term: 'Real-Time Operational Dashboard',
    description: 'Live present, late, and absent metrics with departmental breakdowns and morning muster charts.',
    category: 'Monitoring',
  },
  {
    term: 'Searchable Roster & CSV Export',
    description: 'Sortable attendance tables with filterable columns and one-click CSV downloads for administrative records.',
    category: 'Reporting',
  },
  {
    term: 'Teacher & Faculty Directory',
    description: 'Departmental rosters indexing active instructional staff, assigned academic sections, and credentials.',
    category: 'Directory',
  },
  {
    term: 'Student & Cadet Directory',
    description: 'Centralized institutional directory tracking student numbers, assigned barcodes, and section cohorts.',
    category: 'Directory',
  },
  {
    term: 'Notice Board & Live Activity Log',
    description: 'Central bulletin for administrative updates alongside a timestamped chronological audit stream of scans.',
    category: 'Communication',
  },
];

export function Ledger() {
  return (
    <section
      id="what-it-does"
      className="py-16 md:py-24 border-y border-slate-200 bg-white"
      aria-labelledby="what-it-does-heading"
    >
      <Container>
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <Eyebrow className="mb-3">Current Capabilities</Eyebrow>
          <h2 id="what-it-does-heading" className="text-fluid-h2 text-[#0a1c33]">
            What ChronoAttendis does today
          </h2>
          <p className="mt-3 text-fluid-body text-slate-600">
            Available features running in the current system deployment at JBLCF-Bacolod.
          </p>
        </div>

        {/* Two-Column Ledger Table */}
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Column 1 */}
            <div className="divide-y divide-slate-200">
              {LEDGER_ITEMS.slice(0, 3).map((item, index) => (
                <div
                  key={index}
                  className="py-6 pr-0 md:pr-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-6"
                >
                  <div className="sm:w-2/5 shrink-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#976b08] block mb-1">
                      {item.category}
                    </span>
                    <span className="text-base font-semibold text-[#0a1c33]">
                      {item.term}
                    </span>
                  </div>
                  <div className="sm:w-3/5">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2 */}
            <div className="divide-y divide-slate-200">
              {LEDGER_ITEMS.slice(3, 6).map((item, index) => (
                <div
                  key={index}
                  className="py-6 pl-0 md:pl-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-6"
                >
                  <div className="sm:w-2/5 shrink-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#976b08] block mb-1">
                      {item.category}
                    </span>
                    <span className="text-base font-semibold text-[#0a1c33]">
                      {item.term}
                    </span>
                  </div>
                  <div className="sm:w-3/5">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
