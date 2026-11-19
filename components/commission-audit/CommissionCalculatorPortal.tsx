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
    <div className="min-h-screen bg-[#05080F] text-slate-100 flex flex-col">
      {/* Unified Top Bar */}
      <header className="border-b border-slate-800/80 bg-[#0B1120]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <AuditBrand tag="Client Fulfillment Portal" />

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            <Link
              href="/commission-audit"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Audit Workspace
            </Link>
            <Link
              href="/commission-calculator"
              className="text-white font-semibold whitespace-nowrap shrink-0"
            >
              Leakage Calculator
            </Link>
            <Link
              href="/clients"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Clients
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#10B981] transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Zed Automation
            </Link>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/free-audit"
              className="inline-flex items-center justify-center rounded-lg bg-[#10B981] text-[#05080F] hover:bg-emerald-400 px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0"
            >
              Written 3-Deal Audit
            </Link>
            <button
              type="button"
              onClick={lockWorkspace}
              title="Re-lock the private audit terminal"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[#05080F] text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Lock Workspace
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-14">
        <div className="w-full max-w-4xl mx-auto md:hidden pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#10B981] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Zed Automation
          </Link>
        </div>
        <CommissionLeakageCalculator />
      </main>

      {/* Footer */}
      <footer className="bg-[#0B1120] border-t border-slate-800/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; Zed Automation &mdash; Real Estate Commission Audit &amp; Leakage Calculator</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[#10B981] hover:underline">
              Home
            </Link>
            <span>&middot;</span>
            <Link href="/commission-audit" className="text-slate-300 hover:text-white">
              Audit Workspace
            </Link>
            <span>&middot;</span>
            <Link href="/clients" className="text-slate-300 hover:text-white">
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
