'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { BrandMark } from '@/components/brand/brand-mark';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  // Add subtle border and shadow only after user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape key press and trap/restore focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        toggleBtnRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
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
    { href: '#what-it-does', label: 'What it does' },
    { href: '#how-it-works', label: 'How it works' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md transition-all duration-200 ease-institutional',
        scrolled ? 'border-b border-slate-200 shadow-raised py-3.5' : 'border-b border-transparent py-5'
      )}
    >
      <Container className="flex items-center justify-between">
        {/* Brand Crest & Title */}
        <Link
          href="/"
          className="flex items-center gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4780] rounded-[8px] p-1 -m-1 select-none"
        >
          <BrandMark size="md" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-lg tracking-tight text-[#0a1c33] group-hover:text-[#1b4780] transition-colors duration-120">
              ChronoAttendis
            </span>
            <span className="text-[11px] font-semibold text-[#976b08] uppercase tracking-[0.06em]">
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
              className="text-sm font-medium text-slate-700 hover:text-[#0a1c33] transition-colors duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4780] rounded-[8px] px-2 py-1"
            >
              {link.label}
            </a>
          ))}

          <Button href="/login" variant="primary" size="sm">
            Sign in
          </Button>
        </nav>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2.5">
          <Button href="/login" variant="primary" size="sm">
            Sign in
          </Button>
          <button
            ref={toggleBtnRef}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-menu"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="w-11 h-11 flex items-center justify-center rounded-[8px] border border-slate-200 text-slate-700 hover:text-[#0a1c33] hover:bg-slate-50 transition-colors duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4780]"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </Container>

      {/* Accessible Mobile Menu */}
      {isOpen && (
        <div
          id="mobile-nav-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="md:hidden fixed inset-x-0 top-[73px] bg-white border-b border-slate-200 shadow-floating px-6 py-6 transition-all duration-200 ease-institutional"
        >
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-slate-800 hover:text-[#0a1c33] py-2 border-b border-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4780] rounded-[8px]"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <Button
                href="/login"
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Sign in to ChronoAttendis
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
