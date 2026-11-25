'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Calendar,
  Search,
  Plus,
  Pin,
  AlertCircle,
  Eye,
  EyeOff,
  BellRing,
  Filter,
  Printer,
  FileText,
  Clock,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notice } from '@/types/attendance';
import { useAttendanceStore } from '@/state/attendance-store';
import { Modal } from '@/components/ui/modal';
import { formatDatePHT, formatTimePHT, toManilaISO } from '@/lib/time';

export function NoticeBoardView() {
  const { state, saveNotices } = useAttendanceStore();
  const notices = state.notices;

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pinned' | 'unread' | 'read'>('all');

  // Reader Modal State (R15)
  const [readingNotice, setReadingNotice] = useState<Notice | null>(null);

  // Post Notice Modal State (R14)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<
    'Regimental Order' | 'Academic Advisory' | 'Administrative Memo'
  >('Regimental Order');
  const [formBody, setFormBody] = useState('');
  const [formAudience, setFormAudience] = useState<'All' | 'Faculty' | 'Students' | 'Cadets'>('All');
  const [formExpiresAt, setFormExpiresAt] = useState('');
  const [formIsUrgent, setFormIsUrgent] = useState(false);
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Filtered notices based on search, category, and read/pinned status (R13)
  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        notice.title.toLowerCase().includes(q) ||
        notice.body.toLowerCase().includes(q) ||
        notice.memoNumber.toLowerCase().includes(q) ||
        notice.author.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === 'all' || notice.category === selectedCategory;

      const isRead = Boolean(notice.readAt);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pinned' && notice.isPinned) ||
        (statusFilter === 'unread' && !isRead) ||
        (statusFilter === 'read' && isRead);

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [notices, search, selectedCategory, statusFilter]);

  // Sort pinned notices first, then date descending (newest first)
  const sortedNotices = useMemo(() => {
    return [...filteredNotices].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });
  }, [filteredNotices]);

  // Toggle Read / Unread and persist to storage (D8, N11)
  const toggleReadStatus = async (noticeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = notices.map((n) => {
      if (n.id !== noticeId) return n;
      return {
        ...n,
        readAt: n.readAt ? undefined : toManilaISO(new Date()),
      };
    });
    await saveNotices(updated);
    if (readingNotice?.id === noticeId) {
      setReadingNotice(updated.find((n) => n.id === noticeId) || null);
    }
  };

  // Toggle Pin to top and persist (D8, N11)
  const togglePin = async (noticeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = notices.map((n) =>
      n.id === noticeId ? { ...n, isPinned: !n.isPinned } : n
    );
    await saveNotices(updated);
    if (readingNotice?.id === noticeId) {
      setReadingNotice(updated.find((n) => n.id === noticeId) || null);
    }
  };

  // Open Notice in reader and mark as read automatically (R15)
  const handleOpenNotice = async (notice: Notice) => {
    setReadingNotice(notice);
    if (!notice.readAt) {
      const readTimestamp = toManilaISO(new Date());
      const updated = notices.map((n) =>
        n.id === notice.id ? { ...n, readAt: readTimestamp } : n
      );
      await saveNotices(updated);
      setReadingNotice({ ...notice, readAt: readTimestamp });
    }
  };

  // Validate and post new circular (R14)
  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formTitle.trim()) {
      errors.title = 'Notice Subject / Title is mandatory.';
    } else if (formTitle.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters long.';
    }

    if (!formBody.trim()) {
      errors.body = 'Directive or circular content is mandatory.';
    } else if (formBody.trim().length < 10) {
      errors.body = 'Circular body must provide clear memorandum directives.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      if (errors.title) titleRef.current?.focus();
      else if (errors.body) bodyRef.current?.focus();
      return;
    }

    const seq = String(notices.length + 1).padStart(3, '0');
    const prefix =
      formCategory === 'Regimental Order'
        ? 'REG-ORD'
        : formCategory === 'Academic Advisory'
          ? 'ACAD-ADV'
          : 'MEMO-ADM';

    const newNotice: Notice = {
      id: `notice-${Date.now()}`,
      memoNumber: `${prefix}-2026-${seq}`,
      title: formTitle.trim(),
      body: formBody.trim(),
      category: formCategory,
      author: state.profile.name || 'Capt. Roberto M. Sian',
      postedAt: toManilaISO(new Date()),
      expiresAt: formExpiresAt ? `${formExpiresAt}T23:59:59+08:00` : undefined,
      audience: formAudience,
      isPinned: formIsPinned,
      isUrgent: formIsUrgent,
    };

    // Persist to storage via store (D8, N11)
    await saveNotices([newNotice, ...notices]);
    setIsPostModalOpen(false);
    setFormTitle('');
    setFormBody('');
    setFormExpiresAt('');
    setFormIsUrgent(false);
    setFormIsPinned(false);
    setFormErrors({});
  };

  // Print official institutional circular
  const handlePrintNotice = (notice: Notice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Institutional Memorandum - ${notice.memoNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0A1C33; }
            .header { text-align: center; border-bottom: 2px solid #0E294B; padding-bottom: 20px; margin-bottom: 24px; }
            .inst { font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #0E294B; }
            .loc { font-size: 12px; color: #64748B; margin-top: 2px; }
            .memo-no { font-size: 14px; font-weight: bold; font-family: monospace; color: #0E294B; margin-top: 16px; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
            .meta-table td { padding: 6px 0; border-bottom: 1px solid #E2E8F0; }
            .meta-label { font-weight: bold; width: 140px; color: #475569; text-transform: uppercase; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 16px; }
            .body { font-size: 13px; line-height: 1.7; white-space: pre-wrap; margin-bottom: 40px; }
            .signatory { margin-top: 40px; border-top: 1px solid #CBD5E1; padding-top: 12px; width: 280px; }
            .sign-name { font-weight: bold; font-size: 14px; }
            .sign-title { font-size: 12px; color: #64748B; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="inst">John B. Lacson Colleges Foundation – Bacolod</div>
            <div class="loc">Alijis Campus • Bacolod City, Philippines</div>
            <div class="memo-no">OFFICIAL CIRCULAR: ${notice.memoNumber}</div>
          </div>
          <table class="meta-table">
            <tr><td class="meta-label">Classification:</td><td>${notice.category} ${notice.isUrgent ? '(PRIORITY / URGENT)' : ''}</td></tr>
            <tr><td class="meta-label">Date Promulgated:</td><td>${formatDatePHT(notice.postedAt)}</td></tr>
            <tr><td class="meta-label">Target Audience:</td><td>${notice.audience}</td></tr>
            <tr><td class="meta-label">Author / Office:</td><td>${notice.author}</td></tr>
          </table>
          <div class="title">${notice.title}</div>
          <div class="body">${notice.body}</div>
          <div class="signatory">
            <div class="sign-name">${notice.author}</div>
            <div class="sign-title">Authorized Signatory / Institutional Officer</div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const unreadCount = notices.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#0A1C33]">
              Institutional Notice Board &amp; Circulars
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#0E294B] text-[#DEB033]">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Official announcements, Regimental Orders, and advisories for JBLCF-Bacolod
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormTitle('');
            setFormBody('');
            setFormExpiresAt('');
            setFormIsUrgent(false);
            setFormIsPinned(false);
            setFormErrors({});
            setIsPostModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0E294B] hover:bg-[#143765] text-white text-xs font-bold rounded-md shadow-sm transition-colors shrink-0 self-start md:self-auto"
        >
          <Plus size={15} />
          <span>Post Circular</span>
        </button>
      </div>

      {/* Search and Filters Toolbar (R13) */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search circulars by subject, memo number, directive body, or author..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B] focus:border-[#0E294B]"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as 'all' | 'pinned' | 'unread' | 'read'
                )
              }
              aria-label="Filter by notice status"
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
            >
              <option value="all">All Statuses ({notices.length})</option>
              <option value="pinned">Pinned to Top</option>
              <option value="unread">Unread Only ({unreadCount})</option>
              <option value="read">Read Only</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <span className="text-[11px] font-semibold text-slate-500 mr-1 shrink-0">
            Category:
          </span>
          {[
            'all',
            'Regimental Order',
            'Academic Advisory',
            'Administrative Memo',
          ].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3 py-1 rounded text-xs font-semibold transition-colors shrink-0',
                selectedCategory === cat
                  ? 'bg-[#0E294B] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {cat === 'all' ? 'All Bulletins' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Circulars List */}
      <div className="space-y-4">
        {sortedNotices.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
            <BellRing className="mx-auto text-slate-300" size={32} />
            <p className="font-bold text-slate-700 text-sm">No circulars found</p>
            <p className="text-slate-400">
              There are no announcements matching your filter criteria.
            </p>
          </div>
        ) : (
          sortedNotices.map((circular) => {
            const isRead = Boolean(circular.readAt);

            return (
              <div
                key={circular.id}
                onClick={() => handleOpenNotice(circular)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenNotice(circular);
                  }
                }}
                className={cn(
                  'bg-white rounded-lg border p-5 shadow-sm space-y-3 transition-all cursor-pointer hover:shadow-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E294B]',
                  isRead
                    ? 'border-slate-200 bg-slate-50/40 opacity-85'
                    : 'border-slate-300 hover:border-[#0E294B]/60',
                  circular.isPinned &&
                  'ring-1 ring-[#DEB033]/50 bg-[#FFFDF5] border-amber-300'
                )}
              >
                {/* Meta Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    {circular.isPinned && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#0E294B] text-[#DEB033]">
                        <Pin size={10} /> PINNED
                      </span>
                    )}

                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                        circular.isUrgent
                          ? 'bg-red-100 text-red-900 border border-red-300'
                          : 'bg-[#E3ECF7] text-[#0E294B] border border-[#CBD5E1]'
                      )}
                    >
                      {circular.category}
                    </span>

                    <span className="font-mono text-xs font-semibold text-slate-500">
                      {circular.memoNumber}
                    </span>

                    <span className="text-[11px] font-medium text-slate-500">
                      Audience: {circular.audience}
                    </span>

                    {!isRead && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        NEW
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{formatDatePHT(circular.postedAt)}</span>
                    </span>

                    {/* Quick Pin Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => togglePin(circular.id, e)}
                      aria-label={circular.isPinned ? 'Unpin circular' : 'Pin circular'}
                      className={cn(
                        'p-1 rounded transition-colors',
                        circular.isPinned
                          ? 'text-[#C99313] hover:bg-amber-100'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      )}
                      title={circular.isPinned ? 'Unpin memo' : 'Pin to top'}
                    >
                      <Pin size={14} />
                    </button>

                    {/* Quick Read/Unread Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleReadStatus(circular.id, e)}
                      aria-label={isRead ? 'Mark as Unread' : 'Mark as Read'}
                      className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                      title={isRead ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      {isRead ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Directive Title & Body Preview */}
                <div>
                  <h3 className="text-base font-bold text-[#0A1C33] mb-1.5 flex items-center gap-2">
                    {circular.isUrgent && (
                      <AlertCircle size={16} className="text-red-600 shrink-0" />
                    )}
                    <span>{circular.title}</span>
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                    {circular.body}
                  </p>
                </div>

                {/* Footer Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Signatory: {circular.author}</span>
                  <div className="flex items-center gap-2">
                    {circular.expiresAt && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Expires: {circular.expiresAt.slice(0, 10)}
                      </span>
                    )}
                    {isRead ? (
                      <span className="text-slate-400 italic">Read</span>
                    ) : (
                      <span className="text-blue-700 font-semibold">Click to read full memo →</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Full Notice Reader Modal (R15) */}
      {readingNotice && (
        <Modal
          isOpen={true}
          onClose={() => setReadingNotice(null)}
          title={`Official Circular: ${readingNotice.memoNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs text-slate-700">
            {/* Classification & Status Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    'px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider',
                    readingNotice.isUrgent
                      ? 'bg-red-100 text-red-900 border border-red-300'
                      : 'bg-[#0E294B] text-white'
                  )}
                >
                  {readingNotice.category}
                </span>

                {readingNotice.isPinned && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <Pin size={11} /> PINNED
                  </span>
                )}
                {readingNotice.isUrgent && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                    <AlertCircle size={12} /> URGENT DIRECTIVE
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => togglePin(readingNotice.id)}
                  className="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 flex items-center gap-1 text-xs"
                >
                  <Pin size={12} />
                  <span>{readingNotice.isPinned ? 'Unpin' : 'Pin to Top'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleReadStatus(readingNotice.id)}
                  className="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 flex items-center gap-1 text-xs"
                >
                  {readingNotice.readAt ? <EyeOff size={12} /> : <Eye size={12} />}
                  <span>{readingNotice.readAt ? 'Mark Unread' : 'Mark Read'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintNotice(readingNotice)}
                  className="px-3 py-1 rounded bg-[#0E294B] hover:bg-[#143765] text-white font-bold flex items-center gap-1.5 text-xs shadow-xs"
                >
                  <Printer size={12} className="text-[#DEB033]" />
                  <span>Print Memo</span>
                </button>
              </div>
            </div>

            {/* Memorandum Metadata Table */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-slate-500 font-semibold">Promulgated:</span>
                  <span className="font-bold text-slate-800">
                    {formatDatePHT(readingNotice.postedAt)} ({formatTimePHT(readingNotice.postedAt)})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-400" />
                  <span className="text-slate-500 font-semibold">Audience:</span>
                  <span className="font-bold text-slate-800">
                    {readingNotice.audience}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  <span className="text-slate-500 font-semibold">Validity:</span>
                  <span className="text-slate-800 font-mono">
                    {readingNotice.expiresAt
                      ? `Expires on ${readingNotice.expiresAt.slice(0, 10)}`
                      : 'Permanent Institutional Circular'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-slate-400" />
                  <span className="text-slate-500 font-semibold">Signatory:</span>
                  <span className="font-bold text-slate-800">
                    {readingNotice.author}
                  </span>
                </div>
              </div>
            </div>

            {/* Full Subject Title */}
            <div>
              <h3 className="text-lg font-bold text-[#0A1C33] leading-snug">
                {readingNotice.title}
              </h3>
            </div>

            {/* Full Directive Body */}
            <div className="p-4 bg-white border border-slate-200 rounded-lg whitespace-pre-wrap leading-relaxed text-slate-800 text-xs font-sans">
              {readingNotice.body}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">
                John B. Lacson Colleges Foundation – Bacolod Official Bulletin
              </span>
              <button
                type="button"
                onClick={() => setReadingNotice(null)}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Post Circular Modal with full validation (R14) */}
      {isPostModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsPostModalOpen(false)}
          title="Draft Institutional Notice or Order"
          maxWidth="md"
        >
          <form onSubmit={handlePostNotice} noValidate className="space-y-4 text-xs">
            {Object.keys(formErrors).length > 0 && (
              <div
                role="alert"
                className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-xs flex items-start gap-2"
              >
                <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Please complete required fields:</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {Object.values(formErrors).map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="notice-form-title"
                className="block font-semibold text-slate-700 mb-1"
              >
                Notice Subject / Title <span className="text-red-500">*</span>
              </label>
              <input
                ref={titleRef}
                id="notice-form-title"
                type="text"
                value={formTitle}
                onChange={(e) => {
                  setFormTitle(e.target.value);
                  if (formErrors.title) {
                    setFormErrors((prev) => ({ ...prev, title: '' }));
                  }
                }}
                placeholder="e.g. Mandatory Annual General Inspection & Formation"
                aria-invalid={Boolean(formErrors.title)}
                className={cn(
                  'w-full px-3 py-2 bg-slate-50 border rounded-md focus:bg-white focus:outline-none focus:ring-1',
                  formErrors.title
                    ? 'border-red-400 focus:ring-red-500 bg-red-50/30'
                    : 'border-slate-300 focus:ring-[#0E294B]'
                )}
              />
              {formErrors.title && (
                <p className="text-red-600 text-[11px] mt-1">{formErrors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="notice-form-category"
                  className="block font-semibold text-slate-700 mb-1"
                >
                  Classification
                </label>
                <select
                  id="notice-form-category"
                  value={formCategory}
                  onChange={(e) =>
                    setFormCategory(
                      e.target.value as
                      | 'Regimental Order'
                      | 'Academic Advisory'
                      | 'Administrative Memo'
                    )
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
                >
                  <option value="Regimental Order">Regimental Order</option>
                  <option value="Academic Advisory">Academic Advisory</option>
                  <option value="Administrative Memo">Administrative Memo</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="notice-form-audience"
                  className="block font-semibold text-slate-700 mb-1"
                >
                  Target Audience
                </label>
                <select
                  id="notice-form-audience"
                  value={formAudience}
                  onChange={(e) =>
                    setFormAudience(
                      e.target.value as 'All' | 'Faculty' | 'Students' | 'Cadets'
                    )
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
                >
                  <option value="All">All Campus</option>
                  <option value="Cadets">Maritime Cadets</option>
                  <option value="Students">All Students</option>
                  <option value="Faculty">Faculty &amp; Officers</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="notice-form-expiry"
                className="block font-semibold text-slate-700 mb-1"
              >
                Expiry Date (Optional)
              </label>
              <input
                id="notice-form-expiry"
                type="date"
                value={formExpiresAt}
                onChange={(e) => setFormExpiresAt(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-300 rounded-md font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Leave empty for permanent institutional circular.
              </span>
            </div>

            <div>
              <label
                htmlFor="notice-form-body"
                className="block font-semibold text-slate-700 mb-1"
              >
                Directive / Circular Body <span className="text-red-500">*</span>
              </label>
              <textarea
                ref={bodyRef}
                id="notice-form-body"
                rows={5}
                value={formBody}
                onChange={(e) => {
                  setFormBody(e.target.value);
                  if (formErrors.body) {
                    setFormErrors((prev) => ({ ...prev, body: '' }));
                  }
                }}
                placeholder="State the official memorandum directives, dates, uniform guidelines, and instructions..."
                aria-invalid={Boolean(formErrors.body)}
                className={cn(
                  'w-full px-3 py-2 bg-slate-50 border rounded-md focus:bg-white focus:outline-none focus:ring-1 leading-relaxed',
                  formErrors.body
                    ? 'border-red-400 focus:ring-red-500 bg-red-50/30'
                    : 'border-slate-300 focus:ring-[#0E294B]'
                )}
              />
              {formErrors.body && (
                <p className="text-red-600 text-[11px] mt-1">{formErrors.body}</p>
              )}
            </div>

            <div className="flex items-center gap-6 pt-1 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsUrgent}
                  onChange={(e) => setFormIsUrgent(e.target.checked)}
                  className="rounded text-[#0E294B] focus:ring-[#0E294B]"
                />
                <span className="font-semibold text-slate-700">Flag as Urgent Priority</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="rounded text-[#0E294B] focus:ring-[#0E294B]"
                />
                <span className="font-semibold text-slate-700">Pin to Top of Bulletin</span>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPostModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0E294B] hover:bg-[#143765] text-white rounded-md font-bold shadow-xs transition-colors"
              >
                Post Circular
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
