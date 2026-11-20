'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

import AuditAccessGate, { useAuditGate } from '@/components/commission-audit/AuditAccessGate';
import AuditBrand from '@/components/commission-audit/AuditBrand';
import CommissionLeakageCalculator from '@/components/CommissionLeakageCalculator';

function CommissionCalculatorWorkspace() {
  const { lockWorkspace } = useAuditGate();

  return (
    <div className="min-h-screen bg-[#040807] text-slate-100 flex flex-col relative">
      {/* Subtle top emerald atmospheric glow matching landing page */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.09),transparent_65%)] z-0"
      />

      {/* Unified Executive Glass Top Bar */}
      <header className="border-b border-emerald-400/15 bg-[#040807]/85 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <AuditBrand tag="Client Fulfillment Portal" />

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            <Link
              href="/commission-audit"
              className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
            >
              Audit Workspace
            </Link>
            <Link
              href="/commission-calculator"
              className="text-emerald-300 font-semibold whitespace-nowrap shrink-0"
            >
              Leakage Calculator
            </Link>
            <Link
              href="/clients"
              className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
            >
              Clients
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Zed Automation
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <Link
              href="/free-audit"
              className="inline-flex items-center justify-center rounded-lg bg-[#10B981] text-[#040807] hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.28)] px-3 sm:px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              Written 3-Deal Audit
            </Link>
            <button
              type="button"
              onClick={lockWorkspace}
              title="Re-lock the private audit terminal"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-medium rounded-lg bg-[#0B1210]/90 text-slate-300 hover:text-emerald-300 border border-emerald-400/20 hover:border-emerald-400/45 transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Lock Workspace</span>
              <span className="sm:hidden">Lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-14">
        <div className="w-full max-w-4xl mx-auto md:hidden pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Zed Automation
          </Link>
        </div>
        <CommissionLeakageCalculator />
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-[#040807]/90 border-t border-emerald-400/15 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; Zed Automation &mdash; Real Estate Commission Audit &amp; Leakage Calculator</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-emerald-300 hover:underline">
              Home
            </Link>
            <span className="text-emerald-400/30">&middot;</span>
            <Link href="/commission-audit" className="text-slate-300 hover:text-emerald-300 transition-colors">
              Audit Workspace
            </Link>
            <span className="text-emerald-400/30">&middot;</span>
            <Link href="/clients" className="text-slate-300 hover:text-emerald-300 transition-colors">
              Clients
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CommissionCalculatorPortal() {
  return (
    <AuditAccessGate>
      <CommissionCalculatorWorkspace />
    </AuditAccessGate>
  );
}
