import React from 'react';
import { GraduationCap, Briefcase, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Reveal } from '@/components/ui/reveal';

const PERSONAS = [
  {
    icon: GraduationCap,
    role: 'Cadets & Students',
    institution: 'College of Maritime Education & CBA',
    benefits: [
      'Fast, single-scan check-in at morning colors and gates',
      'Eliminates disputed manual sign-in and handwriting errors',
      'Official proof of attendance for maritime licensure records',
      'Clear, audible confirmation at the scanner station',
    ],
  },
  {
    icon: Briefcase,
    role: 'Faculty & Instructors',
    institution: 'Departmental Faculty & Training Staff',
    benefits: [
      'Zero class minutes lost to calling student roll',
      'Instant access to filtered section attendance rosters',
      'One-click Excel-safe CSV export for grading compliance',
      'Manual override fallback for unreadable or forgotten IDs',
    ],
  },
  {
    icon: ShieldCheck,
    role: 'Officers & Administrators',
    institution: 'Office of the Commandant & Academic Deans',
    benefits: [
      'Live campus-wide muster percentage and hourly influx trends',
      'Configurable late arrival cutoffs tailored to morning inspection',
      'Immutable audit trail recording time, gate, and verification method',
      'Centralized student directory with credential status tracking',
    ],
  },
];

export function WhoItIsFor() {
  return (
    <section
      id="who-it-is-for"
      className="py-16 md:py-24 bg-[#f8fafc] border-b border-slate-200"
      aria-labelledby="who-it-is-for-heading"
    >
      <Container>
        <div className="max-w-3xl mb-12 md:mb-16">
          <Eyebrow className="mb-4">Stakeholders & Users</Eyebrow>
          <h2
            id="who-it-is-for-heading"
            className="text-fluid-h2 text-[#0a1c33] leading-tight"
          >
            Built for everyone at JBLCF-Bacolod.
          </h2>
          <p className="mt-4 text-fluid-body text-slate-600">
            From regimental inspection at dawn to laboratory practicals in the afternoon, ChronoAttendis supports institutional operations across campus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERSONAS.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal
                key={item.role}
                variant="fade-up"
                delay={index * 90}
                className="h-full"
              >
                <div className="h-full bg-white border border-slate-200/90 rounded-[12px] p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
                  <div>
                    <div className="w-10 h-10 rounded-[8px] bg-[#0e294b] flex items-center justify-center text-[#c99313] mb-4">
                      <Icon size={20} strokeWidth={2} aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0a1c33] mb-1">
                      {item.role}
                    </h3>
                    <p className="text-xs font-semibold text-[#976b08] uppercase tracking-wider mb-5">
                      {item.institution}
                    </p>

                    <ul className="space-y-2.5 text-xs text-slate-600">
                      {item.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#0e294b] font-bold mt-0.5">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
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

