import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  variant?: 'white' | 'tint' | 'deep-blue';
  borderTop?: boolean;
  borderBottom?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  white: 'bg-white text-[#0f172a]',
  tint: 'bg-[#f1f6fc] text-[#0f172a]',
  'deep-blue': 'bg-[#0a1c33] text-[#f8fafc]',
};

export function Section({
  as: Component = 'section',
  variant = 'white',
  borderTop = false,
  borderBottom = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Component
      className={cn(
        'w-full py-[clamp(64px,8vw,128px)]',
        variantClasses[variant],
        borderTop && 'border-t border-slate-200',
        borderBottom && 'border-b border-slate-200',
        variant === 'deep-blue' && borderTop && 'border-t border-[#143765]',
        variant === 'deep-blue' && borderBottom && 'border-b border-[#143765]',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
