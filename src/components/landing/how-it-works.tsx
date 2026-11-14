import React from 'react';
import { ScanLine, Database, CheckCircle, BarChart3 } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Reveal } from '@/components/ui/reveal';

const STEPS = [
  {
    step: '01',
    icon: ScanLine,
    title: 'Student Scans ID at Entry Station',
    description:
      'Cadets and students present their institutional ID card to the USB or Bluetooth barcode scanner at campus gates, muster grounds, or classroom doors. Keystroke bursts are verified within 50 milliseconds.',
  },
  {
    step: '02',
    icon: CheckCircle,
    title: 'Institutional Rules & Time Policy Applied',
    description:
      'The system instantly evaluates arrival time against the departmental late cutoff (default 07:45 AM PHT), verifies active enrollment, and enforces duplicate scan cooldowns to prevent double counts.',
  },
  {
    step: '03',
    icon: Database,
    title: 'Audit Log & Live Activity Stream Updated',
    description:
      'The check-in record is written with an ISO 8601 Asia/Manila timestamp, gate identity, verification method, and status. Screen readers receive immediate polite announcements.',
  },
  {
    step: '04',
    icon: BarChart3,
    title: 'Reports & Section Rosters Ready for Export',
    description:
      'Instructors, department chairs, and regimental officers view live muster statistics and export sanitized, Excel-safe CSV attendance rosters on demand.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-16 md:py-24 bg-white border-b border-slate-200"
      aria-labelledby="how-it-works-heading"
    >
      <Container>
        <div className="max-w-3xl mb-12 md:mb-16">
          <Eyebrow className="mb-4">Operational Architecture</Eyebrow>
          <h2
            id="how-it-works-heading"
            className="text-fluid-h2 text-[#0a1c33] leading-tight"
          >
            How ChronoAttendis tracks attendance in four verified steps.
          </h2>
          <p className="mt-4 text-fluid-body text-slate-600">
            Engineered to replace manual roll calls with verifiable barcode scans while maintaining regimental compliance and student accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal
                key={item.step}
                variant="fade-up"
                delay={index * 80}
                className="h-full"
              >
                <div className="h-full bg-slate-50 border border-slate-200 rounded-[12px] p-6 flex flex-col justify-between hover:border-slate-300 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-[#c99313] bg-[#fffdf5] border border-[#c99313]/30 px-2 py-0.5 rounded">
                        STEP {item.step}
                      </span>
                      <div className="w-9 h-9 rounded-[8px] bg-[#0e294b]/5 border border-[#143765]/10 flex items-center justify-center text-[#0e294b]">
                        <Icon size={18} strokeWidth={2} aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-[#0a1c33] mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

