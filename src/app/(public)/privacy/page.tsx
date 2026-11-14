import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Nav } from '@/components/landing/nav';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = {
  title: 'Data Privacy Policy | ChronoAttendis',
  description:
    'Institutional data privacy and student record protection policy for ChronoAttendis at JBLCF-Bacolod.',
};

export default function PrivacyPage() {
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
              <Shield size={18} className="text-[#0e294b]" />
              <Eyebrow>Institutional Compliance</Eyebrow>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#0a1c33] mb-4">
              Data Privacy &amp; Student Record Policy
            </h1>

            <p className="text-xs font-mono text-slate-500 mb-8 pb-4 border-b border-slate-100">
              Effective Date: Academic Year 2026–2027 • Republic Act 10173 (Data Privacy Act of 2012)
            </p>

            <div className="space-y-6 text-xs md:text-sm text-slate-700 leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#0a1c33]">1. Institutional Mandate</h2>
                <p>
                  ChronoAttendis is deployed exclusively for John B. Lacson Colleges Foundation – Bacolod (JBLCF-Bacolod) to record, monitor, and report student and cadet attendance during academic classes, regimental colors, laboratory sessions, and official campus assemblies.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#0a1c33]">2. Collected Information</h2>
                <p>
                  The system records only operational credentials required for verified attendance tracking:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Institutional Student Number and assigned Barcode Identifier</li>
                  <li>Student Full Name, Academic Program, Year Level, and Section cohort</li>
                  <li>Scan Timestamp (recorded in official Philippine Standard Time, UTC+8)</li>
                  <li>Station Terminal Location (e.g., Gate 1, Maritime Quadrangle, Classroom)</li>
                  <li>Verification Method (Barcode HID Scanner or Authorized Manual Override)</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#0a1c33]">3. Purpose of Processing</h2>
                <p>
                  Data is processed strictly for academic compliance, maritime licensure eligibility verification, safety drill accountability, and institutional attendance reports submitted to CHED and MARINA.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#0a1c33]">4. Security &amp; Access Controls</h2>
                <p>
                  Attendance logs are restricted to authorized instructors, department heads, and regimental officers. All manual overrides require documented justification recorded in an immutable audit log.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#0a1c33]">5. Student Rights &amp; Inquiries</h2>
                <p>
                  Under RA 10173, students and cadets have the right to inspect their recorded attendance history and dispute discrepancies through the Office of Student Affairs or their academic department head.
                </p>
              </section>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

