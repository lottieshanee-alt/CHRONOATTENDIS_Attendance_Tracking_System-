import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Terminal, HeartHandshake } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/brand/brand-mark';

export function Footer() {
  return (
    <footer className="bg-[#0a1c33] text-slate-300 border-t border-[#143765]">
      {/* Pre-footer Call to Action */}
      <div className="border-b border-[#143765] py-16 md:py-20">
        <Container>
          <div className="max-w-3xl flex flex-col items-start">
            <span className="font-mono text-xs font-semibold text-[#c99313] uppercase tracking-wider mb-3">
              Deployment Ready • AY 2026–2027
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
              Modern attendance infrastructure for John B. Lacson Colleges Foundation – Bacolod.
            </h2>
            <p className="mt-3 text-sm md:text-base text-slate-400 max-w-[55ch]">
              Eliminate paper rosters, accelerate morning muster, and verify every student check-in with institutional precision.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button href="/login" variant="primary" size="md">
                <span>Access Terminal Login</span>
                <ArrowRight className="w-4 h-4 text-[#c99313]" aria-hidden="true" />
              </Button>
              <a
                href="#what-it-does"
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c99313]"
              >
                Review System Specifications
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Footer Directory */}
      <div className="py-12 md:py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Column 1: Brand & Institutional Scope */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <BrandMark size="sm" />
                <span className="font-bold text-white text-base tracking-wide">
                  ChronoAttendis
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[42ch]">
                Official barcode attendance tracking and muster monitoring system for John B. Lacson Colleges Foundation – Bacolod. Developed for maritime, business, and senior high school academic units.
              </p>
              <div className="flex items-center gap-4 text-[11px] text-[#c99313] font-mono">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} aria-hidden="true" />
                  Philippine Standard Time (PHT)
                </span>
                <span className="flex items-center gap-1.5">
                  <Terminal size={13} aria-hidden="true" />
                  HID Wedge Ready
                </span>
              </div>
            </div>

            {/* Column 2: System Navigation */}
            <div className="md:col-span-3 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Platform
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#what-it-does" className="hover:text-white transition-colors">
                    What it does
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#who-it-is-for" className="hover:text-white transition-colors">
                    Who it is for
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Frequently Asked Questions
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Station Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Institutional & Legal Links */}
            <div className="md:col-span-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Institutional Information
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About JBLCF-Bacolod &amp; ChronoAttendis
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Data Privacy &amp; Student Record Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Institutional Service
                  </Link>
                </li>
              </ul>
              <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                <HeartHandshake size={13} className="text-[#c99313]" aria-hidden="true" />
                <span>Bacolod City, Negros Occidental, Philippines</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright (hardcoded year to comply with Cache Components) */}
          <div className="mt-12 pt-6 border-t border-[#143765] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <span>
              © 2026 John B. Lacson Colleges Foundation – Bacolod. All rights reserved.
            </span>
            <span className="font-mono text-[11px]">
              ChronoAttendis v0.1.0 • PHT UTC+8
            </span>
          </div>
        </Container>
      </div>
    </footer>
  );
}

