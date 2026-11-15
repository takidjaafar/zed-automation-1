import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  FileSpreadsheet,
  Lock,
  ShieldCheck,
  Users,
} from 'lucide-react';
import AuditBrand from '@/components/commission-audit/AuditBrand';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#05080F] text-slate-100 flex flex-col">
      {/* Unified Header */}
      <header className="border-b border-slate-800/80 bg-[#05080F]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <AuditBrand tag="Client Fulfillment Portal" />

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="https://zedautomation.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-[#0B1120] border border-slate-800 hover:border-slate-700 transition whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#10B981]" />
              Back to Zed Automation
            </a>
            <Link
              href="/commission-audit"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#10B981] text-[#05080F] hover:bg-emerald-400 transition whitespace-nowrap shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              Open Audit Terminal
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-3xl w-full space-y-6">
          {/* Primary Portal Card */}
          <div className="bg-[#0B1120] border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs uppercase font-semibold tracking-wider text-[#10B981] bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Client Fulfillment Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Access-Key Gated Workspace
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Zed Automation · Commission Audit &amp; GCI Recovery Suite
              </h1>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Detect brokerage overpayments, agent split shortfalls, closing-disclosure mismatches,
                and uncollected incoming referral fees across closed real estate transactions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href="/commission-audit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] hover:bg-emerald-400 text-[#05080F] font-semibold text-sm h-11 px-5 shadow-sm transition whitespace-nowrap"
              >
                <Lock className="w-4 h-4" />
                Launch GCI Audit Terminal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/commission-calculator"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#05080F] border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 text-slate-200 font-semibold text-sm h-11 px-5 transition whitespace-nowrap"
              >
                <Calculator className="w-4 h-4 text-[#10B981]" />
                Leakage Calculator
              </Link>
            </div>
          </div>

          {/* Secondary Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-slate-800/80 bg-[#0B1120] space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Users className="w-4 h-4 text-[#10B981]" />
                Client &amp; Audit History
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Manage brokerage workspaces, review period history, and copy read-only executive share links.
              </p>
              <Link
                href="/clients"
                className="text-xs font-semibold text-[#10B981] hover:underline inline-flex items-center gap-1 pt-1"
              >
                Open Client Directory &rarr;
              </Link>
            </div>

            <div className="p-5 rounded-xl border border-slate-800/80 bg-[#0B1120] space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-[#10B981]" />
                Standalone Offline HTML Audit
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Self-contained single-file brokerage reconciliation sheet for offline spreadsheet imports.
              </p>
              <a
                href="/commission-audit.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#10B981] hover:underline inline-flex items-center gap-1 pt-1"
              >
                Open Standalone HTML &rarr;
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-4">
          <span>Zed Automation · Commission Audit &amp; GCI Recovery</span>
          <span>&bull;</span>
          <a
            href="https://zedautomation.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#10B981] hover:underline"
          >
            zedautomation.vercel.app
          </a>
        </div>
      </footer>
    </div>
  );
}
