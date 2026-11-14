'use client';

import React, { useState } from 'react';
import { Calendar, Search, Plus, Pin, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notice } from '@/types/attendance';
import { useAttendanceStore } from '@/state/attendance-store';
import { Modal } from '@/components/ui/modal';
import { formatDatePHT } from '@/lib/time';

export function NoticeBoardView() {
  const { state } = useAttendanceStore();
  const [notices, setNotices] = useState<Notice[]>(state.notices);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [readNoticeIds, setReadNoticeIds] = useState<Set<string>>(new Set());

  // Post Notice Modal
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'Regimental Order' | 'Academic Advisory' | 'Administrative Memo'>('Regimental Order');
  const [formBody, setFormBody] = useState('');
  const [formAudience, setFormAudience] = useState<'All' | 'Faculty' | 'Students' | 'Cadets'>('All');
  const [formIsUrgent, setFormIsUrgent] = useState(false);
  const [formIsPinned, setFormIsPinned] = useState(false);

  const toggleReadStatus = (id: string) => {
    setReadNoticeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(search.toLowerCase()) ||
      notice.body.toLowerCase().includes(search.toLowerCase()) ||
      notice.memoNumber.toLowerCase().includes(search.toLowerCase());

    const matchesCat =
      selectedCategory === 'all' || notice.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  // Sort pinned notices first, then date descending
  const sortedNotices = [...filteredNotices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formBody.trim()) return;

    const seq = String(notices.length + 1).padStart(3, '0');
    const prefix = formCategory === 'Regimental Order' ? 'REG-ORD' : formCategory === 'Academic Advisory' ? 'ACAD-ADV' : 'MEMO-ADM';

    const newNotice: Notice = {
      id: `notice-${Date.now()}`,
      memoNumber: `${prefix}-2026-${seq}`,
      title: formTitle.trim(),
      body: formBody.trim(),
      category: formCategory,
      author: state.profile.name || 'Administrative Office',
      postedAt: new Date().toISOString(),
      audience: formAudience,
      isPinned: formIsPinned,
      isUrgent: formIsUrgent,
    };

    setNotices([newNotice, ...notices]);
    setIsPostModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#0A1C33]">
            Institutional Notice Board &amp; Circulars
          </h2>
          <p className="text-xs text-slate-500">
            Official announcements from the Board of Trustees, Dean&apos;s Office, and Regimental Command
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search circulars or memos..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B] focus:border-[#0E294B]"
            />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto">
            {['all', 'Regimental Order', 'Academic Advisory', 'Administrative Memo'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded text-xs font-semibold transition-colors',
                  selectedCategory === cat
                    ? 'bg-[#0E294B] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {cat === 'all' ? 'All' : cat.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setFormTitle('');
              setFormBody('');
              setIsPostModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0E294B] hover:bg-[#143765] text-white text-xs font-bold rounded-md shadow-sm transition-colors shrink-0"
          >
            <Plus size={14} />
            <span>Post Circular</span>
          </button>
        </div>
      </div>

      {/* Circulars List */}
      <div className="space-y-4">
        {sortedNotices.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-xs text-slate-500">
            No institutional circulars matching your search criteria.
          </div>
        ) : (
          sortedNotices.map((circular) => {
            const isRead = readNoticeIds.has(circular.id);

            return (
              <div
                key={circular.id}
                className={cn(
                  'bg-white rounded-lg border p-5 shadow-sm space-y-3 transition-colors',
                  isRead ? 'border-slate-200 opacity-80' : 'border-slate-200 hover:border-slate-300',
                  circular.isPinned && 'ring-1 ring-[#DEB033]/40 bg-[#FFFDF5]'
                )}
              >
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
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{formatDatePHT(circular.postedAt)}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleReadStatus(circular.id)}
                      className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                      title={isRead ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      {isRead ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0A1C33] mb-1.5 flex items-center gap-2">
                    {circular.isUrgent && (
                      <AlertCircle size={16} className="text-red-600 shrink-0" />
                    )}
                    <span>{circular.title}</span>
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {circular.body}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Signatory: {circular.author}</span>
                  {isRead && (
                    <span className="text-slate-400 italic">Read on this device</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Post Circular Modal */}
      {isPostModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsPostModalOpen(false)}
          title="Draft Institutional Notice or Order"
          maxWidth="md"
        >
          <form onSubmit={handlePostNotice} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Notice Title / Subject
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Schedule of Annual Physical Inspection"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Classification
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as 'Regimental Order' | 'Academic Advisory' | 'Administrative Memo')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
                >
                  <option value="Regimental Order">Regimental Order</option>
                  <option value="Academic Advisory">Academic Advisory</option>
                  <option value="Administrative Memo">Administrative Memo</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Audience
                </label>
                <select
                  value={formAudience}
                  onChange={(e) => setFormAudience(e.target.value as 'All' | 'Faculty' | 'Students' | 'Cadets')}
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
              <label className="block font-semibold text-slate-700 mb-1">
                Directive / Circular Body
              </label>
              <textarea
                required
                rows={4}
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                placeholder="State the official memorandum details, dates, and instructions..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
              />
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsUrgent}
                  onChange={(e) => setFormIsUrgent(e.target.checked)}
                  className="rounded text-[#0E294B]"
                />
                <span className="font-semibold text-slate-700">Flag as Urgent Priority</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="rounded text-[#0E294B]"
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
                className="px-4 py-2 bg-[#0E294B] hover:bg-[#143765] text-white rounded-md font-bold shadow-xs"
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
