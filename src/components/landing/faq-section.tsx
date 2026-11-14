'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { cn } from '@/lib/utils';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'What hardware is required to operate ChronoAttendis?',
    answer:
      'ChronoAttendis operates with standard USB and Bluetooth Human Interface Device (HID) barcode scanners operating in keyboard wedge mode. No proprietary drivers or custom software installations are required on station terminals.',
  },
  {
    question: 'How are duplicate barcode scans handled?',
    answer:
      'Repeated scans of the same student credential within the active session are automatically flagged and rejected. An configurable cooldown period (default 3 seconds) prevents physical button double-clicks from generating duplicate entries, and the dashboard provides both a visual warning and distinct acoustic feedback.',
  },
  {
    question: 'Can attendance be taken if a student forgot or lost their ID?',
    answer:
      'Yes. Authorized officers and faculty can use the Manual Override workflow. The student is selected from the institutional enrollment directory, marked present or late, and tagged with a mandatory audit reason (e.g., "Forgotten ID", "Damaged Barcode", or "Official Duty").',
  },
  {
    question: 'What time policy determines whether a student is on time or late?',
    answer:
      'Cutoff rules are evaluated against official Philippine Standard Time (PHT, Asia/Manila timezone, UTC+8). The default cutoff is 07:45 AM PHT for morning colors and can be reconfigured per terminal in Account & Hardware settings.',
  },
  {
    question: 'Does the system support biometric or RFID turnstiles?',
    answer:
      'ChronoAttendis is architected specifically around barcode credentials printed on institutional student cards. Turnstile relay control, biometrics, and RFID interfaces are outside the active deployment scope.',
  },
  {
    question: 'Is student attendance data exportable for grading and reporting?',
    answer:
      'Yes. The Attendance Roster provides real-time CSV exports sanitized with formula injection protection, UTF-8 BOM encoding for seamless Microsoft Excel compatibility, and standardized ISO 8601 timestamps.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="py-16 md:py-24 bg-white border-b border-slate-200"
      aria-labelledby="faq-heading"
    >
      <Container>
        <div className="max-w-3xl mb-12 md:mb-16">
          <Eyebrow className="mb-4">Common Questions</Eyebrow>
          <h2
            id="faq-heading"
            className="text-fluid-h2 text-[#0a1c33] leading-tight"
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-fluid-body text-slate-600">
            Answers regarding barcode scanning, institutional attendance policies, hardware compatibility, and data security.
          </p>
        </div>

        <div className="max-w-3xl divide-y divide-slate-200 border-y border-slate-200">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            const headingId = `faq-h-${index}`;
            const panelId = `faq-p-${index}`;

            return (
              <div key={index} className="py-4 md:py-5">
                <button
                  type="button"
                  id={headingId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between text-left gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4780] rounded-[6px] py-1"
                >
                  <span className="text-base font-bold text-[#0a1c33] group-hover:text-[#1b4780] transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={cn(
                      'text-slate-400 group-hover:text-[#0a1c33] transition-transform duration-200 shrink-0',
                      isOpen && 'rotate-180 text-[#0e294b]'
                    )}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={headingId}
                    className="mt-3 text-sm text-slate-600 leading-relaxed pr-6"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

