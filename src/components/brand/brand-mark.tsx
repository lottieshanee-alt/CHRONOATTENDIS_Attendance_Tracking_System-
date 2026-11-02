import React from 'react';
import { cn } from '@/lib/utils';

interface BrandMarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8 rounded-[8px] border',
  md: 'w-10 h-10 rounded-[8px] border-2',
  lg: 'w-12 h-12 rounded-[12px] border-2',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
};

export function BrandMark({ className, size = 'md' }: BrandMarkProps) {
  return (
    <div
      className={cn(
        'bg-[#0E294B] border-[#C99313] flex items-center justify-center shrink-0 shadow-sm',
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
    >
      <svg
        className={cn('text-[#C99313]', iconSizes[size])}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="5" r="3" />
        <line x1="12" y1="8" x2="12" y2="21" />
        <line x1="8" y1="11" x2="16" y2="11" />
        <path d="M5 14c0 4.5 3.5 7 7 7s7-2.5 7-7" />
        <line x1="4" y1="13" x2="6" y2="13" />
        <line x1="18" y1="13" x2="20" y2="13" />
      </svg>
    </div>
  );
}
