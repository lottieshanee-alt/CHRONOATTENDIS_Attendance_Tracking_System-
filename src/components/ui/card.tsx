import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'tint' | 'deep-blue';
  interactive?: boolean;
  children: React.ReactNode;
}

const variantStyles = {
  white: 'bg-white border-slate-200 text-[#0f172a]',
  tint: 'bg-[#f1f6fc]/90 border-slate-200 text-[#0f172a]',
  'deep-blue': 'bg-[#0e294b] border-[#143765] text-slate-100',
};

export function Card({
  variant = 'white',
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[12px] border p-6',
        variantStyles[variant],
        interactive &&
          'card-hover cursor-pointer hover:border-slate-300 dark:hover:border-slate-600',
        variant === 'deep-blue' && interactive && 'hover:border-[#c99313]/60',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
