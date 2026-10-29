import React from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: {
    id: string;
    isInvalid: boolean;
    'aria-describedby'?: string;
  }) => React.ReactNode;
}

export function Field({
  id,
  label,
  hint,
  error,
  required = false,
  className,
  children,
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-[#0a1c33] select-none"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      </div>

      {children({
        id,
        isInvalid: Boolean(error),
        'aria-describedby': describedBy,
      })}

      {hint && !error && (
        <p id={hintId} className="text-xs text-slate-500 leading-normal">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-red-600 leading-normal"
        >
          {error}
        </p>
      )}
    </div>
  );
}
