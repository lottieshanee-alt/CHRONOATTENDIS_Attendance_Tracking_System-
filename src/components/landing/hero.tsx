import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Button } from '@/components/ui/button';
import { PhotoFrame } from './photo-frame';

export function Hero() {
  return (
    <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Eyebrow, H1, Subcopy, CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Plain text eyebrow with gold hairline */}
            <Eyebrow className="mb-5">
              John B. Lacson Colleges Foundation: Bacolod
            </Eyebrow>

            {/* H1 Headline with one gold accent word */}
            <h1 className="text-fluid-h1 text-[#061220]">
              Attendance, <span className="text-[#976b08]">scanned</span> in seconds.
            </h1>

            {/* Subcopy */}
            <p className="mt-6 text-fluid-body text-slate-700 max-w-[62ch]">
              ChronoAttendis helps JBLCF-Bacolod faculty record and review student attendance with a barcode scan, so class time goes to teaching.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href="/login" variant="primary" size="lg">
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4 text-[#c99313]" aria-hidden="true" />
              </Button>

              <Button href="#how-it-works" variant="secondary" size="lg">
                See how it works
              </Button>
            </div>

            {/* Operational context */}
            <p className="mt-6 text-xs text-slate-500 font-medium">
              Built for USB and Bluetooth HID barcode readers in maritime classrooms and regimental musters.
            </p>
          </div>

          {/* Right Column: Photo Frame with One Labeled Sample Result Card */}
          <div className="lg:col-span-5 relative w-full max-w-lg mx-auto lg:max-w-none">
            <PhotoFrame
              slot="hero-campus"
              aspectClassName="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]"
              priority={true}
              caption="Placeholder: JBLCF campus photo"
              sizes="(max-width: 1024px) 100vw, 42vw"
            >
              {/* Overlapping Honest Labeled Sample Result Card */}
              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white border border-slate-200 rounded-[12px] p-4 shadow-floating select-none w-64">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-1.5 py-0.5 rounded-[4px] bg-slate-100">
                    Sample result
                  </span>
                  <span className="text-[11px] tabular-nums text-slate-500">
                    07:45 AM
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#0a1c33]">
                      Sample Cadet
                    </span>
                    <span className="text-xs text-slate-500 tabular-nums">
                      ID: #0000
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-[6px] border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    Present
                  </span>
                </div>
              </div>
            </PhotoFrame>
          </div>
        </div>
      </Container>
    </section>
  );
}
