'use client';

import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BellRing,
  UserCheck,
  QrCode,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab = 'dashboard' | 'teacher' | 'student' | 'notices' | 'account';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  scannerConnected?: boolean;
  onOpenScannerStation: () => void;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  scannerConnected = true,
  onOpenScannerStation,
}: SidebarProps) {
  const navigationItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Attendance Metrics & Logs',
      badge: null,
    },
    {
      id: 'teacher' as NavTab,
      label: 'Teacher & Faculty',
      icon: UserCheck,
      description: 'Departmental Rosters',
      badge: '18 Active',
    },
    {
      id: 'student' as NavTab,
      label: 'Students & Cadets',
      icon: GraduationCap,
      description: 'Enrollment Directory',
      badge: '2,840',
    },
    {
      id: 'notices' as NavTab,
      label: 'Notice Board',
      icon: BellRing,
      description: 'Institutional Circulars',
      badge: '3 New',
    },
    {
      id: 'account' as NavTab,
      label: 'Edit Account',
      icon: SlidersHorizontal,
      description: 'Credentials & Hardware',
      badge: null,
    },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-[#0A1C33] text-slate-100 transition-all duration-300 ease-in-out border-r border-[#143765] z-30 select-none shrink-0',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center px-4 border-b border-[#143765] justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Institutional Anchor Crest Emblem */}
          <div className="w-11 h-11 rounded-md bg-[#0E294B] border-2 border-[#C99313] flex items-center justify-center shrink-0 shadow-sm">
            <svg
              className="w-6 h-6 text-[#C99313]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Institutional Anchor / Maritime Motif */}
              <circle cx="12" cy="5" r="3" />
              <line x1="12" y1="8" x2="12" y2="21" />
              <line x1="8" y1="11" x2="16" y2="11" />
              <path d="M5 14c0 4.5 3.5 7 7 7s7-2.5 7-7" />
              <line x1="4" y1="13" x2="6" y2="13" />
              <line x1="18" y1="13" x2="20" y2="13" />
            </svg>
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base tracking-wide text-white truncate">
                ChronoAttendis
              </span>
              <span className="text-xs font-medium text-[#C99313] uppercase tracking-wider truncate">
                JBLCF-Bacolod
              </span>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-[#143765] transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2">
          {!collapsed ? (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Institutional Navigation
            </span>
          ) : (
            <div className="h-4" />
          )}
        </div>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={cn(
                'w-full flex items-center rounded-md text-left transition-colors font-medium',
                collapsed ? 'justify-center p-3' : 'px-3.5 py-2.5 gap-3',
                isActive
                  ? 'bg-[#143765] text-white border-l-4 border-[#C99313] shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#0E294B]'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={20}
                className={cn(
                  'shrink-0',
                  isActive ? 'text-[#C99313]' : 'text-slate-400'
                )}
              />
              {!collapsed && (
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <span className="truncate text-sm">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'ml-2 px-2 py-0.5 text-[10px] font-semibold rounded',
                        isActive
                          ? 'bg-[#0E294B] text-[#DEB033]'
                          : 'bg-[#143765] text-slate-300'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="pt-4 pb-2">
          <div className="border-t border-[#143765]" />
        </div>

        {/* Hardware Status Widget */}
        <div className={cn(collapsed ? 'px-1' : 'px-2')}>
          <button
            type="button"
            onClick={onOpenScannerStation}
            className={cn(
              'w-full rounded-md border border-[#1B4780] bg-[#0E294B] hover:bg-[#143765] transition-all text-left group',
              collapsed ? 'p-2 flex flex-col items-center justify-center' : 'p-3'
            )}
            title="Open Barcode & RFID Scanner Station"
          >
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <QrCode size={18} className="text-[#C99313]" />
                <span
                  className={cn(
                    'absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#0E294B]',
                    scannerConnected
                      ? 'bg-emerald-500 status-indicator-live'
                      : 'bg-amber-500'
                  )}
                />
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">
                      HID Scanner Ready
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-800">
                      LIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    USB / Bluetooth Wedge
                  </p>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="mt-2 pt-2 border-t border-[#163A63] flex items-center justify-between text-[11px] text-[#DEB033]">
                <span>Launch Scanner Tester</span>
                <span className="font-mono text-[10px] bg-[#143765] px-1.5 py-0.5 rounded text-slate-200">
                  F9 / Auto
                </span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Institutional Officer / Faculty Profile */}
      <div className="p-3 border-t border-[#143765] bg-[#08172b]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[#143765] border border-[#C99313] flex items-center justify-center font-bold text-sm text-[#C99313] shrink-0">
            RS
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white truncate">
                  Capt. R. M. Sian
                </span>
                <ShieldCheck size={14} className="text-[#DEB033] shrink-0" />
              </div>
              <p className="text-xs text-slate-400 truncate">
                Dean of Maritime Studies
              </p>
            </div>
          )}

          {!collapsed && (
            <button
              type="button"
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#143765] transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
