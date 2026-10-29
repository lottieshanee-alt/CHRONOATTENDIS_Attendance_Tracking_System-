import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', isInvalid = false, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'w-full h-11 px-3.5 text-base sm:text-sm rounded-[8px] bg-white border',
          'text-slate-900 placeholder:text-slate-400',
          'transition-colors duration-120 ease-institutional',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          isInvalid
            ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
            : 'border-slate-300 hover:border-slate-400 focus-visible:border-[#1b4780] focus-visible:ring-[#1b4780]',
          'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
          className
        )}
        aria-invalid={isInvalid ? 'true' : undefined}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
