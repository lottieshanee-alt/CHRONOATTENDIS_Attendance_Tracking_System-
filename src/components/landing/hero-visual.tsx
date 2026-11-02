'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DashboardPreview } from './dashboard-preview';

export function HeroVisual() {
  const [offsetY, setOffsetY] = useState(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    const handleScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          if (window.innerWidth >= 1024) {
            // Parallax translation capped at 24px
            const scrollDistance = window.scrollY;
            const calculated = Math.min(Math.max(scrollDistance * 0.06, 0), 24);
            setOffsetY(calculated);
          } else {
            setOffsetY(0);
          }
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="relative w-full max-w-xl mx-auto lg:max-w-none animate-hero-frame will-change-transform"
      style={{
        transform: offsetY > 0 ? `translateY(${offsetY}px)` : undefined,
      }}
    >
      <DashboardPreview />
    </div>
  );
}
