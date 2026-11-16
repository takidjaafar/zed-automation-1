'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  FileSpreadsheet,
  Lock,
  Mail,
} from 'lucide-react';

import HeroAuditTerminal from '@/components/landing/HeroAuditTerminal';
import InlineLeakageSandbox, {
  type SandboxAuditPreset,
} from '@/components/landing/InlineLeakageSandbox';
import WrittenAuditModal from '@/components/landing/WrittenAuditModal';

const PROTOCOL_ROWS = [
  {
    code: 'PR-01',
    discrepancy: 'Agent Split & Anniversary Cap Drift',
    source: 'Closing Disclosure + Brokerage Cap Ledger',
    impact: '$950 – $2,400 / deal',
    remediation: 'Pre-payout split tier check & ledger clawback log',
  },
  {
    code: 'PR-02',
    discrepancy: 'Uncollected Outbound Referral Fees',
    source: 'Relocation & Partner Referral Agreements',
    impact: '20% – 35% of side GCI',
    remediation: 'Automated referral receivable flag prior to close',
  },
  {
    code: 'PR-03',
    discrepancy: 'Admin & Compliance Fee Omissions',
    source: 'HUD-1 / ALTA Settlement Statement',
    impact: '$395 – $695 / side',
    remediation: 'Mandatory fee reconciliation against broker waiver policy',
  },
  {
    code: 'PR-04',
    discrepancy: 'Speed-to-Lead Pipeline Decay',
    source: 'CRM Lead Routing & Response Timestamps',
    impact: '18% – 27% GCI / quarter',
    remediation: '<90s automated SMS & email lead capture sequence',
  },
] as const;

const ASYNC_STEPS = [
  {
    step: '01',
    title: 'Submit 3 Closed Deals',
    timing: '5 min written intake',
    detail:
      'Enter three recent settlement references, contracted split percentages, and paid amounts in our on-page modal. 100% written intake with no calendar booking required.',
  },
  {
    step: '02',
    title: 'Forensic Ledger Reconciliation',
    timing: 'Hours 1 – 36',
    detail:
      'Our audit desk checks agent split tiers, cap thresholds, referral deductions, compliance fees, and response-time GCI leakage row by row.',
  },
  {
    step: '03',
    title: 'Written PDF & Private Loom',
    timing: 'Delivered within 48h',
    detail:
      'Receive a confidential PDF discrepancy report, copyable executive recovery ledger, and private async walkthrough directly at your work email.',
  },
] as const;

function formatUsd(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
}

export default function LandingClientShell() {
  const [modalOpen, setModalOpen] = useState(false);
  const [prefilledNotes, setPrefilledNotes] = useState('');

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleOpenWithSandboxPreset = (preset: SandboxAuditPreset) => {
    setPrefilledNotes(
      `Sandbox baseline: ${preset.monthlyDeals} closed sides/mo @ ${formatUsd(preset.avgGci)} avg GCI (${preset.responseTierLabel} response). Est. annual leakage ${formatUsd(preset.annualLeakage)}; projected 90-day recovery +${formatUsd(preset.projected90dRecovery)}.`,
    );
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col">
      {/* 3-Zone Editorial Obsidian Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07090E]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Left: Clean Brand Lockup */}
          <Link href="/" className="flex items-center gap-3 min-w-0 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-[#0D1017] border border-white/[0.12] flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src="/assets/aistudio/ZED_SVG_e2b1063b.svg"
                alt="Zed Automation logo"
                width={32}
                height={32}
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-sm sm:text-base font-bold tracking-[-0.02em] text-white whitespace-nowrap shrink-0">
              Zed Automation
            </span>
          </Link>

          {/* Center: Internal Audit Suite Navigation */}
          <nav
            aria-label="Audit suite navigation"
            className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400"
          >
            <Link
              href="/commission-audit"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Audit Workspace
            </Link>
            <Link
              href="/commission-calculator"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Leakage Calculator
            </Link>
            <Link
              href="/clients"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Clients
            </Link>
          </nav>

          {/* Right: External Domain + Single Primary Conversion CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://zedautomations.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              zedautomations.tech
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#07090E] px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Request 3-Deal Audit
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 space-y-20 sm:space-y-24">
          {/* Asymmetric Split Hero + Live GCI Ledger Terminal */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Editorial Copy Column */}
            <div className="lg:col-span-5 space-y-7 pt-1">
              <div className="text-xs font-mono text-slate-400 tracking-wide">
                Async Written Audit · 48h PDF + Loom · Written Delivery Only
              </div>

              <div className="space-y-4">
                <h1 className="text-[clamp(2.25rem,3.8vw,3.35rem)] font-bold tracking-[-0.03em] leading-[1.06] text-white">
                  Recover hidden commission leakage across every closed side.
                </h1>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
                  Forensic GCI verification for managing brokers. Detect agent split drift, uncollected referral fees, closing-disclosure mismatches, and speed-to-lead decay through a 100% asynchronous written workflow.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#07090E] font-semibold text-sm h-11 px-5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Request 3-Deal Written Audit
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="https://audit.zedautomations.tech/commission-audit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0D1017] border border-white/[0.08] border-t-white/[0.15] hover:border-white/[0.18] text-slate-200 hover:text-white font-medium text-sm h-11 px-4 transition-colors whitespace-nowrap shrink-0"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Audit Portal
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>

              {/* Hairline Tabular Telemetry Baseline */}
              <div className="border-t border-white/[0.08] pt-6 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Sample Leakage
                  </div>
                  <div className="mt-1 text-lg sm:text-xl font-mono font-semibold text-white tabular-nums">
                    $7,445
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    90d Net Recovery
                  </div>
                  <div className="mt-1 text-lg sm:text-xl font-mono font-semibold text-[#10B981] tabular-nums">
                    +$33,845
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Turnaround
                  </div>
                  <div className="mt-1 text-lg sm:text-xl font-mono font-semibold text-slate-200 tabular-nums">
                    48h Async
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Brokerage GCI Ledger & Speed-to-Lead Audit Terminal */}
            <div className="lg:col-span-7">
              <HeroAuditTerminal />
            </div>
          </section>

          {/* Section 2: Inline Leakage Sandbox */}
          <InlineLeakageSandbox
            onRequestAuditWithContext={handleOpenWithSandboxPreset}
          />

          {/* Section 3: Audit Protocol Ledger Table */}
          <section id="audit-protocol" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  02 · Forensic Coverage Matrix
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-white">
                  Commission &amp; Pipeline Audit Protocol
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500">
                4 verification classes reconciled per transaction
              </span>
            </div>

            <div className="rounded-xl bg-[#0D1017] border border-white/[0.08] border-t-white/[0.15] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[680px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[11px] font-mono uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-5 font-medium">Discrepancy Class</th>
                      <th className="py-3.5 px-5 font-medium">Verification Source</th>
                      <th className="py-3.5 px-5 font-medium text-right">Typical Impact</th>
                      <th className="py-3.5 px-5 font-medium">Async Remediation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08] text-sm">
                    {PROTOCOL_ROWS.map((row) => (
                      <tr
                        key={row.code}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-baseline gap-2.5">
                            <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                              {row.code}
                            </span>
                            <span className="font-medium text-white">
                              {row.discrepancy}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-xs text-slate-400">
                          {row.source}
                        </td>
                        <td className="py-4 px-5 text-right font-mono text-xs sm:text-[13px] text-rose-400 tabular-nums whitespace-nowrap">
                          {row.impact}
                        </td>
                        <td className="py-4 px-5 text-xs text-slate-300">
                          {row.remediation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 4: Async 48-Hour Written Workflow */}
          <section id="async-workflow" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  03 · Asynchronous Fulfillment
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-white">
                  48-Hour Written Delivery. Zero Meetings Required.
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                100% email + portal fulfillment
              </span>
            </div>

            <div className="rounded-xl bg-[#0D1017] border border-white/[0.08] border-t-white/[0.15] overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
                {ASYNC_STEPS.map((item) => (
                  <div key={item.step} className="p-6 sm:p-7 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">{item.step}</span>
                      <span className="text-slate-500 tabular-nums">{item.timing}</span>
                    </div>
                    <h3 className="text-base font-semibold tracking-[-0.02em] text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>

              <div className="px-6 sm:px-7 py-5 border-t border-white/[0.08] bg-[#090C12] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-white">
                    Ready to verify 3 closed transactions?
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Direct written report &amp; Loom delivered to your inbox · zakaria@zedautomations.tech
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <a
                    href="https://audit.zedautomations.tech/commission-audit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0D1017] border border-white/[0.08] hover:border-white/[0.18] text-slate-200 hover:text-white px-4 h-10 text-xs font-medium transition-colors whitespace-nowrap"
                  >
                    audit.zedautomations.tech
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={handleOpenModal}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#07090E] px-4 h-10 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Open Written Audit Modal
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-white/[0.08] bg-[#07090E] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-medium text-slate-300">Zed Automation</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Commission Audit &amp; GCI Recovery</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <a
              href="mailto:zakaria@zedautomations.tech"
              className="inline-flex items-center gap-1.5 font-mono text-slate-400 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              zakaria@zedautomations.tech
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono">
            <Link href="/commission-audit" className="hover:text-slate-200 transition-colors">
              Workspace
            </Link>
            <Link href="/clients" className="hover:text-slate-200 transition-colors">
              Clients
            </Link>
            <a
              href="/commission-audit.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Offline HTML
            </a>
            <a
              href="https://zedautomations.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#10B981] hover:underline"
            >
              zedautomations.tech
            </a>
          </div>
        </div>
      </footer>

      <WrittenAuditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialNotes={prefilledNotes}
      />
    </div>
  );
}
