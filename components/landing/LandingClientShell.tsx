'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  Lock,
  Mail,
} from 'lucide-react';

import AtmosphericBackdrop from '@/components/landing/AtmosphericBackdrop';
import HeroAuditTerminal from '@/components/landing/HeroAuditTerminal';
import InlineLeakageSandbox, {
  type SandboxAuditPreset,
} from '@/components/landing/InlineLeakageSandbox';
import {
  AnimatedNumber,
  GlassSpotlightCard,
  MagneticButton,
  ScrollReveal,
  TrustMarquee,
} from '@/components/landing/MotionPrimitives';
import {
  ComparisonSection,
  DiagnosticProblemSection,
  InfrastructurePillarsSection,
  RealResultsSection,
} from '@/components/landing/VisualShowcaseSections';
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
    discrepancy: 'Team Overrides & E&O Variance',
    source: 'ALTA Ledger & Brokerage Override Schedule',
    impact: '$420 – $1,350 / deal',
    remediation: 'Automated override & E&O reconciliation prior to ACH payout',
  },
] as const;

const ASYNC_STEPS = [
  {
    step: '01',
    title: 'Submit 3 Closed Deals',
    timing: '5 min written intake',
    detail:
      'Enter three recent settlement references, contracted split percentages, and paid amounts in our on-page modal. 100% written intake with zero live calls or Zoom booking required.',
  },
  {
    step: '02',
    title: 'Forensic Ledger Reconciliation',
    timing: 'Hours 1 – 36',
    detail:
      'Our audit desk checks agent split tiers, cap thresholds, referral deductions, compliance fees, and override calculations row by row.',
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
      `Sandbox baseline: ${preset.monthlyDeals} closed sides/mo @ ${formatUsd(preset.avgGci)} avg GCI (${preset.auditScopeLabel}). Est. annual leakage ${formatUsd(preset.annualLeakage)}; projected 90-day recovery +${formatUsd(preset.projected90dRecovery)}.`,
    );
    setModalOpen(true);
  };

  const handleScrollToSandbox = () => {
    const el = document.getElementById('sandbox');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#040807] text-slate-100 flex flex-col overflow-x-clip">
      <AtmosphericBackdrop />

      {/* Clean Executive Glass Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-emerald-400/15 bg-[#040807]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Left: Brand Lockup */}
          <Link href="/" className="flex items-center gap-3 min-w-0 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-[#0B1210] border border-emerald-400/30 shadow-[0_0_18px_rgba(16,185,129,0.2)] flex items-center justify-center overflow-hidden shrink-0">
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

          {/* Center: Strictly 3 Clean Anchor Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300"
          >
            <a
              href="#protocol"
              className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
            >
              Audit Protocol
            </a>
            <a
              href="#sandbox"
              className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
            >
              Leakage Calculator
            </a>
            <a
              href="#results"
              className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
            >
              Verified Recoveries
            </a>
          </nav>

          {/* Right: 2 Clear Actions (Client Portal + Free 3-Deal Audit CTA) */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/commission-audit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1210]/85 border border-emerald-400/25 hover:border-emerald-400/55 px-3 py-2 text-xs font-medium text-slate-200 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Client Portal
            </Link>
            <MagneticButton>
              <button
                type="button"
                onClick={handleOpenModal}
                className="hidden sm:inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#040807] px-4 py-2 text-xs font-semibold shadow-[0_0_24px_rgba(16,185,129,0.3)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Get Free 3-Deal Audit
              </button>
            </MagneticButton>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {/* Asymmetric Split Hero + Smoked Glass GCI Ledger Terminal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20">
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Editorial Copy Column */}
            <ScrollReveal aboveFold={true} className="lg:col-span-5 space-y-7 pt-1">
              <div className="text-xs font-mono text-emerald-300/90 tracking-wide">
                Async Written Audit · 48h PDF + Loom · Zero Phone Calls
              </div>

              <div className="space-y-4">
                <h1 className="text-[clamp(2.25rem,3.8vw,3.35rem)] font-bold tracking-[-0.03em] leading-[1.06] text-white [text-wrap:balance]">
                  Recover{' '}
                  <span className="text-emerald-400">
                    hidden commission leakage
                  </span>{' '}
                  across every closed side.
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  Forensic GCI verification for managing brokers. Detect agent
                  split drift, uncollected referral fees, closing-disclosure
                  mismatches, and waived compliance charges through a 100%
                  asynchronous written workflow—zero phone calls or Zoom meetings.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <MagneticButton>
                  <button
                    type="button"
                    onClick={handleOpenModal}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#040807] font-semibold text-sm h-11 px-5 shadow-[0_0_28px_rgba(16,185,129,0.35)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Get Free 3-Deal Audit
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </MagneticButton>
                <button
                  type="button"
                  onClick={handleScrollToSandbox}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B1210]/80 backdrop-blur-xl border border-emerald-400/25 hover:border-emerald-400/55 text-slate-100 hover:text-white font-medium text-sm h-11 px-4 shadow-[0_0_24px_rgba(16,185,129,0.1)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Estimate Leakage
                  <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>

              {/* Smoked Glass Tabular Telemetry Baseline */}
              <div className="border-t border-emerald-400/20 pt-6 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Sample Leakage
                  </div>
                  <div className="mt-1 text-lg sm:text-xl font-mono font-semibold text-white">
                    <AnimatedNumber value={7445} prefix="$" />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    90d Audit Recovery
                  </div>
                  <div className="mt-1 text-lg sm:text-xl font-mono font-semibold text-emerald-400">
                    <AnimatedNumber value={22335} prefix="+$" />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Turnaround
                  </div>
                  <div className="mt-1 text-lg sm:text-xl font-mono font-semibold text-slate-100 tabular-nums">
                    48h Async
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Interactive Brokerage GCI Ledger Terminal */}
            <ScrollReveal aboveFold={true} delay={0.1} className="lg:col-span-7">
              <HeroAuditTerminal
                onScrollToSandbox={handleScrollToSandbox}
                onOpenModal={handleOpenModal}
              />
            </ScrollReveal>
          </section>
        </div>

        {/* Continuous Platform Trust Marquee */}
        <TrustMarquee />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-24 sm:space-y-28">
          {/* Section 01: Diagnostic Photo Frame + 3 Sparkline KPI Overlays */}
          <DiagnosticProblemSection onScrollToSandbox={handleScrollToSandbox} />

          {/* Section 02: Inline Leakage Sandbox over Blurred Brokerage Backdrop */}
          <InlineLeakageSandbox
            onRequestAuditWithContext={handleOpenWithSandboxPreset}
          />

          {/* Section 03: Protocol Pillars (4 Glass Preview Cards) + Forensic Coverage Matrix */}
          <div className="space-y-8">
            <InfrastructurePillarsSection />

            <ScrollReveal>
              <GlassSpotlightCard tilt={false} className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[680px]">
                    <thead>
                      <tr className="border-b border-emerald-400/15 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        <th className="py-3.5 px-5 font-medium">
                          Discrepancy Class
                        </th>
                        <th className="py-3.5 px-5 font-medium">
                          Verification Source
                        </th>
                        <th className="py-3.5 px-5 font-medium text-right">
                          Typical Impact
                        </th>
                        <th className="py-3.5 px-5 font-medium">
                          Async Remediation
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-400/10 text-sm">
                      {PROTOCOL_ROWS.map((row) => (
                        <tr
                          key={row.code}
                          className="hover:bg-emerald-400/[0.04] transition-colors"
                        >
                          <td className="py-4 px-5">
                            <div className="flex items-baseline gap-2.5">
                              <span className="text-[11px] font-mono text-emerald-400/80 tabular-nums">
                                {row.code}
                              </span>
                              <span className="font-medium text-white">
                                {row.discrepancy}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-xs text-slate-300">
                            {row.source}
                          </td>
                          <td className="py-4 px-5 text-right font-mono text-xs sm:text-[13px] text-rose-400 tabular-nums whitespace-nowrap">
                            {row.impact}
                          </td>
                          <td className="py-4 px-5 text-xs text-slate-200">
                            {row.remediation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassSpotlightCard>
            </ScrollReveal>
          </div>

          {/* Section 04: Real Results / Case Studies with Executive Portraits */}
          <RealResultsSection />

          {/* Section 05: Old Brokerage Way vs Zed Automation Comparison */}
          <ComparisonSection />

          {/* Section 06: Async 48-Hour Written Workflow (Single Dominant CTA) */}
          <section id="async-workflow" className="space-y-6">
            <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase tracking-[0.16em] text-slate-400">
                  Section 06 · Asynchronous Fulfillment
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.03em] text-white">
                  48-Hour Written Delivery.{' '}
                  <span className="text-emerald-400">Zero Meetings Required.</span>
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-300/90">
                100% written email + PDF delivery
              </span>
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <GlassSpotlightCard tilt={false} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-emerald-400/15">
                  {ASYNC_STEPS.map((item) => (
                    <div key={item.step} className="p-6 sm:p-7 space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-emerald-400 font-semibold">
                          {item.step}
                        </span>
                        <span className="text-slate-400 tabular-nums">
                          {item.timing}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold tracking-[-0.02em] text-white">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="px-6 sm:px-7 py-5 border-t border-emerald-400/15 bg-[#060C0A]/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-white">
                      Ready to verify 3 closed transactions?
                    </div>
                    <div className="text-xs font-mono text-slate-300">
                      Confidential written PDF &amp; Loom delivered in 48h ·{' '}
                      zakaria@zedautomations.tech
                    </div>
                  </div>

                  <MagneticButton className="w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleOpenModal}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#040807] px-5 h-11 text-xs sm:text-sm font-semibold shadow-[0_0_24px_rgba(16,185,129,0.3)] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Submit 3 Deals for Free Written Audit
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </MagneticButton>
                </div>
              </GlassSpotlightCard>
            </ScrollReveal>
          </section>
        </div>
      </main>

      {/* Clean Quiet Footer */}
      <footer className="relative z-10 border-t border-emerald-400/15 bg-[#040807]/85 backdrop-blur-xl py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-medium text-white">Zed Automation</span>
            <span aria-hidden="true" className="text-emerald-400/40">
              ·
            </span>
            <span>Forensic Commission Audit &amp; GCI Recovery</span>
            <span aria-hidden="true" className="text-emerald-400/40">
              ·
            </span>
            <a
              href="mailto:zakaria@zedautomations.tech"
              className="inline-flex items-center gap-1.5 font-mono text-slate-300 hover:text-emerald-300 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              zakaria@zedautomations.tech
            </a>
          </div>

          <div className="flex items-center gap-6 font-mono">
            <button
              type="button"
              onClick={handleOpenModal}
              className="text-emerald-300 hover:text-emerald-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              Request Free Audit
            </button>
            <Link
              href="/commission-audit"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-300 transition-colors whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Client Portal
            </Link>
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
