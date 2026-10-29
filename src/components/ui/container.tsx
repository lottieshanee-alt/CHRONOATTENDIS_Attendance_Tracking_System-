import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  children: React.ReactNode;
}

export function Container({
  as: Component = 'div',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto w-[min(100%-2*var(--gutter,clamp(16px,3.5vw,56px)),96rem)]',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
