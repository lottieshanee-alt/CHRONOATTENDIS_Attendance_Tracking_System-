import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Anchor, Award, Users } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Nav } from '@/components/landing/nav';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = {
  title: 'About ChronoAttendis & JBLCF-Bacolod | Attendance Tracking System',
  description:
    'Background and institutional history of ChronoAttendis at John B. Lacson Colleges Foundation – Bacolod.',
};

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1 py-12 md:py-20 bg-slate-50">
        <Container>
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-[12px] p-6 md:p-10 shadow-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0a1c33] mb-6 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to home</span>
            </Link>

            <div className="flex items-center gap-2 mb-3">
              <Anchor size={18} className="text-[#0e294b]" />
              <Eyebrow>Institutional Background</Eyebrow>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#0a1c33] mb-4">
              About ChronoAttendis &amp; JBLCF-Bacolod
            </h1>

            <p className="text-xs font-mono text-slate-500 mb-8 pb-4 border-b border-slate-100">
              John B. Lacson Colleges Foundation – Bacolod • Alijis Campus
            </p>

            <div className="space-y-6 text-xs md:text-sm text-slate-700 leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#0a1c33]">The Institution</h2>
                <p>
                  John B. Lacson Colleges Foundation (JBLCF) – Bacolod is a premier maritime higher education institution in the Western Visayas, recognized for producing disciplined maritime deck and engine officers, business professionals, and senior high school graduates serving the international seafaring industry.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#0a1c33]">The Attendance Challenge</h2>
                <p>
                  Maritime education requires strict regimental discipline, mandatory morning colors inspections, and compliance with rigorous attendance thresholds established by CHED and the Maritime Industry Authority (MARINA). Traditional paper roll calls created bottlenecks during 07:15 AM colors and resulted in delayed reporting to parents and department chairs.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-bold text-[#0a1c33]">Core System Capabilities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-[8px] bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 font-bold text-[#0a1c33] mb-1">
                      <Anchor size={15} className="text-[#c99313]" />
                      <span>Barcode HID Wedging</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      High-throughput barcode scanning on standard student ID cards with hardware burst detection.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[8px] bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 font-bold text-[#0a1c33] mb-1">
                      <Award size={15} className="text-[#c99313]" />
                      <span>Regulatory Compliance</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Accurate late calculations, Excel-safe CSV exports, and audit trails conforming to maritime standards.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[8px] bg-slate-50 border border-slate-200 sm:col-span-2">
                    <div className="flex items-center gap-2 font-bold text-[#0a1c33] mb-1">
                      <Users size={15} className="text-[#c99313]" />
                      <span>Campus Accessibility</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Accessible screen reader announcements, high-contrast indicators, and keyboard-driven workflows for institutional terminal operators.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

