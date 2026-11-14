import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Nav } from '@/components/landing/nav';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = {
  title: 'Terms of Service | ChronoAttendis',
  description:
    'Institutional terms of service governing the operation and use of ChronoAttendis at JBLCF-Bacolod.',
};

export default function TermsPage() {
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
              <FileText size={18} className="text-[#0e294b]" />
              <Eyebrow>Institutional Regulations</Eyebrow>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#0a1c33] mb-4">
              Terms of Institutional Service
            </h1>

            <p className="text-xs font-mono text-slate-500 mb-8 pb-4 border-b border-slate-100">
              Published for Academic Year 2026–2027 • JBLCF-Bacolod Campus Policy
            </p>

            <div className="space-y-6 text-xs md:text-sm text-slate-700 leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#0a1c33]">1. Acceptance &amp; Scope</h2>
                <p>
                  By accessing ChronoAttendis terminal hardware or web administration interfaces, authorized officers, instructors, and staff agree to adhere to these Institutional Terms and JBLCF-Bacolod academic regulations.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#0a1c33]">2. Credential Integrity &amp; Prohibition of Proxy Scanning</h2>
                <p>
                  Student cards and barcodes are non-transferable institutional credentials. Presenting another student&apos;s barcode card, scanning on behalf of an absent cadet, or fabricating barcode keystrokes constitutes major academic dishonesty subject to regimental disciplinary action.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#0a1c33]">3. Officer Authority &amp; Manual Overrides</h2>
                <p>
                  Manual attendance overrides must be accompanied by a factual institutional reason. Falsifying manual records or voiding legitimate attendance without authorization violates academic audit protocols.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#0a1c33]">4. Official Time Reference</h2>
                <p>
                  All arrival evaluations, late cutoff determinations, and scan audits are governed by Philippine Standard Time (PHT, UTC+8) synchronized via network time protocols. Local terminal clock drifts do not alter official recorded timestamps.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#0a1c33]">5. System Availability &amp; Offline Continuity</h2>
                <p>
                  ChronoAttendis provides local client buffering to ensure turnstiles and gates continue capturing scans during intermittent network disruptions. Terminal operators are responsible for syncing buffers upon reconnection.
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

