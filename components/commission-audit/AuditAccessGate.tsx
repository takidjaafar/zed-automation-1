'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, ShieldCheck } from 'lucide-react';

export const AUDIT_UNLOCK_STORAGE_KEY = 'zed_audit_unlocked';
const EXPECTED_ACCESS_CODE = (process.env.NEXT_PUBLIC_AUDIT_ACCESS_CODE || 'ZED-PRO-2026').trim();

interface AuditGateContextValue {
  isUnlocked: boolean;
  lockWorkspace: () => void;
}

const AuditGateContext = createContext<AuditGateContextValue>({
  isUnlocked: false,
  lockWorkspace: () => undefined,
});

export function useAuditGate(): AuditGateContextValue {
  return useContext(AuditGateContext);
}

/**
 * Persistent Brokerage & Operator Access Gate for the fulfillment workspace
 * and client manager. Stores unlock state in `localStorage` (`zed_audit_unlocked`)
 * and exposes `lockWorkspace` for the top navigation bar.
 */
export default function AuditAccessGate({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(AUDIT_UNLOCK_STORAGE_KEY);
      setIsUnlocked(saved === 'true');
    } catch {
      setIsUnlocked(false);
    } finally {
      setHydrated(true);
    }
  }, []);

  const handleUnlock = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const candidate = accessKey.trim();
      if (!candidate) {
        setError('Enter your brokerage or operator Access Key to continue.');
        return;
      }

      if (candidate !== EXPECTED_ACCESS_CODE) {
        setError('Invalid Access Key. Verify your credentials and try again.');
        return;
      }

      try {
        window.localStorage.setItem(AUDIT_UNLOCK_STORAGE_KEY, 'true');
      } catch {
        // Ignore storage errors in restricted private browsing modes; memory unlock still applies
      }
      setError(null);
      setAccessKey('');
      setIsUnlocked(true);
    },
    [accessKey],
  );

  const lockWorkspace = useCallback(() => {
    try {
      window.localStorage.removeItem(AUDIT_UNLOCK_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setAccessKey('');
    setError(null);
    setIsUnlocked(false);
  }, []);

  const contextValue = useMemo(
    () => ({ isUnlocked, lockWorkspace }),
    [isUnlocked, lockWorkspace],
  );

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#040807] text-slate-300 flex items-center justify-center p-6">
        <div className="text-xs font-mono tracking-wide text-slate-400">
          Verifying terminal session…
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#040807] text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_65%)]"
        />
        <header className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#0B1210] border border-emerald-400/30 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_18px_rgba(16,185,129,0.18)]">
              <Image
                src="/assets/aistudio/ZED_SVG_e2b1063b.svg"
                alt="Zed Automation logo"
                width={36}
                height={36}
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-base font-bold tracking-[-0.02em] text-white whitespace-nowrap shrink-0">
              Zed Automation
            </span>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Zed Automation
          </Link>
        </header>

        <main className="relative z-10 flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-md rounded-2xl bg-[#0B1210]/90 backdrop-blur-2xl border border-emerald-400/25 shadow-[0_0_50px_rgba(16,185,129,0.12)] overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500/80 via-[#10B981] to-teal-400/80" />
            <div className="p-7 sm:p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Client Fulfillment Portal</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-white [text-wrap:balance]">
                  Zed Automation &bull; Private GCI Audit Terminal
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Enter your operator or partner Access Key to decrypt the commission audit workspace and brokerage ledgers.
                </p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-4">
                <div>
                  <label
                    htmlFor="zed-access-key"
                    className="block text-xs font-semibold text-slate-200 mb-2"
                  >
                    Access Key
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="zed-access-key"
                      type={showKey ? 'text' : 'password'}
                      autoComplete="current-password"
                      autoFocus
                      value={accessKey}
                      onChange={(e) => {
                        setAccessKey(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Enter Access Key"
                      className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm font-mono bg-[#040807]/90 text-white placeholder:text-slate-600 outline-none transition focus:ring-2 focus:ring-emerald-400/40 focus:border-[#10B981] ${
                        error ? 'border-rose-500/70' : 'border-emerald-400/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((prev) => !prev)}
                      aria-label={showKey ? 'Hide access key' : 'Show access key'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {error && (
                    <p role="alert" className="mt-2 text-xs font-medium text-rose-400">
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#10B981] hover:bg-emerald-400 text-[#040807] font-bold text-sm transition-colors shadow-[0_0_24px_rgba(16,185,129,0.28)] cursor-pointer whitespace-nowrap"
                >
                  <Lock className="w-4 h-4" />
                  Unlock Audit Workspace
                </button>
              </form>

              <div className="pt-4 border-t border-emerald-400/15">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Authorized for Zed Automation operators &amp; active brokerage partners. Need an audit key? Request one on the{' '}
                  <Link
                    href="/free-audit"
                    className="text-emerald-300 font-medium hover:underline"
                  >
                    3-Deal Written Intake
                  </Link>
                  {' '}or return{' '}
                  <Link
                    href="/"
                    className="text-emerald-300 font-medium hover:underline"
                  >
                    Home
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="relative z-10 max-w-6xl w-full mx-auto py-3 text-center text-xs font-mono text-slate-500">
          Zed Automation &middot; Private Brokerage Commission Audit Infrastructure
        </footer>
      </div>
    );
  }

  return (
    <AuditGateContext.Provider value={contextValue}>
      {children}
    </AuditGateContext.Provider>
  );
}
