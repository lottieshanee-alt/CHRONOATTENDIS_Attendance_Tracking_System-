import React from 'react';
import { cn } from '@/lib/utils';

interface EyebrowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onDark?: boolean;
}

export function Eyebrow({
  children,
  onDark = false,
  className,
  ...props
}: EyebrowProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.06em]',
        onDark ? 'text-[#deb033]' : 'text-[#976b08]',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'w-5 h-[1.5px] rounded-full shrink-0',
          onDark ? 'bg-[#c99313]' : 'bg-[#b5820a]'
        )}
        aria-hidden="true"
      />
      <span>{children}</span>
    </div>
  );
}
