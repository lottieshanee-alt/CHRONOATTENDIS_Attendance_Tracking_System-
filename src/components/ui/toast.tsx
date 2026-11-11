'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastTone = 'success' | 'warning' | 'error' | 'info';

export interface ToastProps {
  id?: string;
  tone?: ToastTone;
  title: string;
  message?: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function Toast({
  tone = 'info',
  title,
  message,
  onDismiss,
  action,
  className,
}: ToastProps) {
  const toneConfig = {
    success: {
      bg: 'bg-[#0A1C33]',
      border: 'border-emerald-500',
      badgeBg: 'bg-emerald-950',
      badgeBorder: 'border-emerald-800',
      badgeText: 'text-emerald-300',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
    warning: {
      bg: 'bg-[#0A1C33]',
      border: 'border-amber-500',
      badgeBg: 'bg-amber-950',
      badgeBorder: 'border-amber-800',
      badgeText: 'text-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
    },
    error: {
      bg: 'bg-[#0A1C33]',
      border: 'border-red-500',
      badgeBg: 'bg-red-950',
      badgeBorder: 'border-red-800',
      badgeText: 'text-red-300',
      icon: AlertCircle,
      iconColor: 'text-red-400',
    },
    info: {
      bg: 'bg-[#0A1C33]',
      border: 'border-[#C99313]',
      badgeBg: 'bg-[#0E294B]',
      badgeBorder: 'border-[#1B4780]',
      badgeText: 'text-[#DEB033]',
      icon: Info,
      iconColor: 'text-[#DEB033]',
    },
  }[tone];

  const Icon = toneConfig.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'text-white px-5 py-3 border-b shadow-md flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-200 z-30',
        toneConfig.bg,
        toneConfig.border,
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon size={16} className={cn('shrink-0', toneConfig.iconColor)} />
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-bold text-white tracking-tight">{title}</span>
          {message && <span className="text-slate-300">{message}</span>}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#DEB033] text-[#0A1C33] hover:bg-yellow-400 transition-colors"
          >
            {action.label}
          </button>
        )}

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

