import React from 'react';
import { ScanLine, Activity, FileSpreadsheet, Anchor } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';

const FACTS = [
  {
    icon: ScanLine,
    title: 'Scans by barcode',
    description: 'Reads student ID cards with USB or Bluetooth scanners.',
  },
  {
    icon: Activity,
    title: 'Counts update live',
    description: 'Present, late and absent tallies update immediately.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Exports to CSV',
    description: 'Download section rosters for administrative records.',
  },
  {
    icon: Anchor,
    title: 'Built for JBLCF',
    description: 'Configured for maritime assemblies and classrooms.',
  },
];

export function AtAGlance() {
  return (
    <section className="relative z-10 -mt-12 pb-12 sm:pb-16" aria-label="System overview at a glance">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FACTS.map((fact, index) => {
            const Icon = fact.icon;
            return (
              <Reveal
                key={fact.title}
                variant="fade-up"
                delay={index * 60}
                className="h-full"
              >
                <div className="h-full bg-white border border-slate-200/90 rounded-[12px] p-5 shadow-raised card-hover hover:border-slate-300 flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-[8px] bg-[#0e294b]/5 border border-[#143765]/10 flex items-center justify-center text-[#1b4780] mb-3.5 shrink-0">
                    <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#0a1c33] tracking-tight">
                      {fact.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                      {fact.description}
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
