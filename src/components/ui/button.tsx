import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  className?: string;
  children: React.ReactNode;
}

export type ButtonProps = BaseButtonProps &
  (
    | (React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined })
    | (React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })
  );

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#0a1c33] text-[#fbf3d5] hover:bg-[#143765] border border-[#c99313]/40 focus-visible:ring-[#c99313]',
  secondary:
    'bg-white text-[#0e294b] hover:bg-slate-50 border border-slate-300 hover:border-slate-400 focus-visible:ring-[#1b4780]',
  ghost:
    'bg-transparent text-slate-700 hover:text-[#0a1c33] hover:bg-slate-100/80 border border-transparent focus-visible:ring-[#1b4780]',
  gold:
    'bg-[#c99313] text-[#061220] hover:bg-[#deb033] border border-[#7d5705]/30 focus-visible:ring-[#0a1c33]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-xs gap-1.5',
  md: 'h-11 px-5 text-sm gap-2', // 44px height for minimum WCAG touch target
  lg: 'h-12 px-6 text-base gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  href,
  ...props
}: ButtonProps) {
  const commonClasses = cn(
    'inline-flex items-center justify-center rounded-[8px] font-semibold select-none',
    'transition-colors duration-120 ease-institutional',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={commonClasses}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  const { disabled, ...buttonProps } = props as React.ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      className={commonClasses}
      disabled={disabled || isLoading}
      {...buttonProps}
    >
      {isLoading && (
        <svg
          className="w-4 h-4 animate-spin text-current shrink-0 mr-1.5"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
