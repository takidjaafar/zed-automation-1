import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AuditBrand from '@/components/commission-audit/AuditBrand';
import CommissionLeakageCalculator from '@/components/CommissionLeakageCalculator';

export const metadata: Metadata = {
  title: 'Commission Leakage Calculator | Zed Automation',
  description:
    'Async financial audit tool for US real estate brokerages. Calculate your exact annual commission, split, and referral fee leakage.',
};

export default function CommissionCalculatorPage() {
  return (
    <div className="min-h-screen bg-[#05080F] text-slate-100 flex flex-col">
      {/* Unified Top Bar */}
      <header className="border-b border-slate-800/80 bg-[#05080F]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <AuditBrand tag="Client Fulfillment Portal" />

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            <Link
              href="/commission-audit"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Audit Workspace
            </Link>
            <Link
              href="/clients"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Clients
            </Link>
            <Link
              href="/commission-calculator"
              className="text-white font-semibold whitespace-nowrap shrink-0"
            >
              Leakage Calculator
            </Link>
          </nav>

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
              href="/free-audit"
              className="inline-flex items-center justify-center rounded-lg bg-[#10B981] text-[#05080F] hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              Written 3-Deal Audit
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-14">
        <CommissionLeakageCalculator />
      </main>
    </div>
  );
}
