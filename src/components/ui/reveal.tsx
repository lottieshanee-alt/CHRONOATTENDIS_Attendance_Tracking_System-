'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

export type RevealVariant = 'fade-up' | 'slide-left' | 'unmask' | 'draw-down';

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number; // milliseconds
  duration?: number; // milliseconds, default 400
  threshold?: number; // default 0.2 (20% visible)
  as?: React.ElementType;
}

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function Reveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 400,
  threshold = 0.2,
  as: Component = 'div',
  className,
  style,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    // Flag client mount after render
    const frame = requestAnimationFrame(() => setMounted(true));

    if (prefersReducedMotion) {
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [threshold, prefersReducedMotion]);

  // When SSR or no-JS or reduced motion: fully visible.
  // After mount with JS and no reduced motion: wait for isVisible.
  const isHidden = mounted && !isVisible && !prefersReducedMotion;

  const getVariantStyles = (): React.CSSProperties => {
    if (prefersReducedMotion) {
      return {};
    }

    const baseTransition = `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, clip-path ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`;

    switch (variant) {
      case 'slide-left':
        return {
          transition: baseTransition,
          opacity: isHidden ? 0 : 1,
          transform: isHidden ? 'translateX(-16px)' : 'translateX(0)',
        };
      case 'unmask':
        return {
          transition: baseTransition,
          opacity: isHidden ? 0 : 1,
          clipPath: isHidden
            ? 'inset(10% 0% 0% 0% round 12px)'
            : 'inset(0% 0% 0% 0% round 12px)',
        };
      case 'draw-down':
        return {
          transition: `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
          transformOrigin: 'top',
          transform: isHidden ? 'scaleY(0)' : 'scaleY(1)',
        };
      case 'fade-up':
      default:
        return {
          transition: baseTransition,
          opacity: isHidden ? 0 : 1,
          transform: isHidden ? 'translateY(16px)' : 'translateY(0)',
        };
    }
  };

  return (
    <Component
      ref={ref}
      className={cn('will-change-transform', className)}
      style={{
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
