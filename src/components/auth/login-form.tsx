'use client';

import React, { useState, useActionState } from 'react';
import Link from 'next/link';
import { LogIn, Lock, User, AlertCircle, Info, X } from 'lucide-react';
import { BrandMark } from '@/components/brand/brand-mark';
import { Button } from '@/components/ui/button';
import { loginAction } from '@/lib/auth/session';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [selectedDemoUser, setSelectedDemoUser] = useState<'admin' | 'teacher'>('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  const fillCredentials = (type: 'admin' | 'teacher') => {
    setSelectedDemoUser(type);
    if (type === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('teacher');
      setPassword('teacher123');
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-[12px] p-6 sm:p-8 shadow-sm">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <Link href="/" className="flex items-center gap-2 mb-3">
          <BrandMark size="md" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0a1c33] tracking-tight">
          Terminal Station Sign In
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          John B. Lacson Colleges Foundation – Bacolod
        </p>
      </div>

      {/* Demo Credentials Picker */}
      <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-[8px] text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#0a1c33] mb-2">
          <Info size={14} className="text-[#c99313]" />
          <span>Demo Accounts (Click to Fill)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillCredentials('admin')}
            className={`p-2 rounded border text-left transition-colors ${
              selectedDemoUser === 'admin'
                ? 'bg-[#0e294b] text-white border-[#0e294b]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="font-bold">Admin Officer</div>
            <div className="text-[10px] opacity-80">admin / admin123</div>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('teacher')}
            className={`p-2 rounded border text-left transition-colors ${
              selectedDemoUser === 'teacher'
                ? 'bg-[#0e294b] text-white border-[#0e294b]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="font-bold">Faculty Member</div>
            <div className="text-[10px] opacity-80">teacher / teacher123</div>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {state?.error && (
        <div
          role="alert"
          className="mb-5 p-3 rounded-[8px] bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2"
        >
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Login Form */}
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Institutional Username
          </label>
          <div className="relative">
            <User
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin or teacher"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-[6px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0e294b]"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-[11px] text-[#0e294b] hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-[6px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0e294b]"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full justify-center mt-2"
          disabled={isPending}
        >
          <LogIn size={15} />
          <span>{isPending ? 'Verifying credentials…' : 'Sign in to Terminal'}</span>
        </Button>
      </form>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-pwd-title"
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-[12px] p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="forgot-pwd-title" className="text-sm font-bold text-[#0a1c33]">
                Account Password Recovery
              </h2>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Password resets for ChronoAttendis terminal accounts are managed directly by the <strong>Management Information System (MIS) Office</strong> of JBLCF-Bacolod. Please contact the campus systems administrator or submit a service ticket to reset your credentials.
            </p>
            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowForgotModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

