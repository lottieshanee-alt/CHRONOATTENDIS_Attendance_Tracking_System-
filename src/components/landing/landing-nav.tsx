'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { BrandMark } from '@/components/brand/brand-mark';
import { cn } from '@/lib/utils';

export function LandingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu on Escape key press and restore focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        toggleBtnRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent background scrolling while mobile drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navLinks = [
    { href: '#how-it-works', label: 'How it works' },
    { href: '#features', label: 'Features' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Link */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4780] rounded-lg p-1 -m-1"
        >
          <BrandMark size="md" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-lg tracking-tight text-[#0a1c33] group-hover:text-[#1b4780] transition-colors duration-120">
              ChronoAttendis
            </span>
            <span className="text-[11px] font-semibold text-[#976b08] uppercase tracking-wider">
              JBLCF-Bacolod
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-8"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-700 hover:text-[#0a1c33] transition-colors duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4780] rounded-md px-1 py-0.5"
            >
              {link.label}
            </a>
          ))}

          <Link
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0a1c33] text-[#fbf3d5] hover:bg-[#143765] border border-[#c99313]/40 shadow-sm transition-colors duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c99313]"
          >
            Sign in
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/login"
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0a1c33] text-[#fbf3d5] border border-[#c99313]/30"
          >
            Sign in
          </Link>
          <button
            ref={toggleBtnRef}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-menu"
            aria-label={isOpen ? 'Close menu' : 'Open navigation menu'}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-slate-700 hover:text-[#0a1c33] hover:bg-slate-100 transition-colors duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4780]"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Disclosure Menu */}
      {isOpen && (
        <div
          id="mobile-nav-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="md:hidden fixed inset-x-0 top-20 bg-white border-b border-slate-200 shadow-floating px-6 py-6 transition-all duration-200 ease-institutional"
        >
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-slate-800 hover:text-[#0a1c33] py-2 border-b border-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4780] rounded"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold bg-[#0a1c33] text-[#fbf3d5] border border-[#c99313]/40 shadow-sm"
              >
                Sign in to ChronoAttendis
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
