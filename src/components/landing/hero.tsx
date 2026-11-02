import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Button } from '@/components/ui/button';
import { HeroVisual } from './hero-visual';

export function Hero() {
  return (
    <section className="relative pt-8 pb-20 md:pt-14 md:pb-24 overflow-hidden" aria-labelledby="hero-title">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Eyebrow, H1, Subcopy, CTAs */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-start">
            <Eyebrow className="mb-5 animate-hero-1">
              John B. Lacson Colleges Foundation: Bacolod
            </Eyebrow>

            <h1 id="hero-title" className="text-fluid-h1 text-[#061220] animate-hero-1">
              Attendance, <span className="text-[#976b08]">scanned</span> in seconds.
            </h1>

            <p className="mt-6 text-fluid-body text-slate-700 max-w-[62ch] animate-hero-2">
              Scan a student ID and the record is saved. Teachers spend class time teaching.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 animate-hero-3">
              <Button href="/login" variant="primary" size="lg">
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4 text-[#c99313]" aria-hidden="true" />
              </Button>

              <Button href="#how-it-works" variant="secondary" size="lg">
                See how it works
              </Button>
            </div>
          </div>

          {/* Right Column: Hero Star Product Preview with Parallax */}
          <div className="lg:col-span-6 xl:col-span-5 relative w-full">
            <HeroVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}
