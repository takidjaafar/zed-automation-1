'use client';

import React from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  Layers,
  Lock,
  ShieldCheck,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  AnimatedNumber,
  GlassSpotlightCard,
  MagneticButton,
  ScrollReveal,
} from '@/components/landing/MotionPrimitives';
import {
  ANONYMIZED_AUDIT_SNAPSHOTS,
  formatSnapshotUsd,
} from '@/lib/commission-audit/landing-proof';

/* -------------------------------------------------------------------------- */
/*  Diagnostic / Problem Photo Frame + 3 Frosted Sparkline KPI Overlays       */
/* -------------------------------------------------------------------------- */

const MINI_BARS_LEAD = [90, 74, 58, 40, 26, 18];
const MINI_BARS_SPEED = [24, 38, 52, 68, 82, 94];
const MINI_BARS_RECOVERED = [28, 36, 48, 62, 78, 96];

export function DiagnosticProblemSection({
  onScrollToSandbox,
}: {
  onScrollToSandbox: () => void;
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
      {/* Left Diagnostic Narrative */}
      <ScrollReveal className="lg:col-span-6 space-y-6">
        <div className="text-xs font-medium text-emerald-300/90">
          Section 01 · Diagnostic · Closing File Reconciliation
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-[-0.03em] leading-[1.08] text-white">
          You Don&apos;t Have a Volume Problem.{' '}
          <span className="text-emerald-400">
            You Have a Commission Leakage Problem.
          </span>
        </h2>

        <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed max-w-xl">
          Every month, silent split drift, uncollected outbound referral fees,
          waived compliance charges, and ALTA settlement mismatches drain
          brokerage net margin. Zed Automation reconciles every closing file
          line-by-line asynchronously with zero meetings.
        </p>

        <div className="pt-1 flex flex-wrap items-center gap-4">
          <MagneticButton>
            <button
              type="button"
              onClick={onScrollToSandbox}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0A110F]/85 border border-white/[0.1] border-t-emerald-400/25 hover:border-white/[0.18] text-white px-5 h-11 text-sm font-semibold transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap"
            >
              Estimate Your Leakage
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </MagneticButton>
          <span className="text-xs text-slate-400">
            100% written audit · Zero live calls
          </span>
        </div>
      </ScrollReveal>

      {/* Right Vertical Glass-Framed Architectural Frame + 3 Frosted KPI Overlays */}
      <ScrollReveal delay={0.12} className="lg:col-span-6">
        <GlassSpotlightCard
          tilt={true}
          className="p-2 sm:p-3 rounded-3xl"
        >
          <div className="relative h-[430px] sm:h-[490px] w-full rounded-2xl overflow-hidden border border-white/[0.08]">
            <Image
              src="/images/office-backdrop.jpg"
              alt="Brokerage executive suite dark architectural ledger environment"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              referrerPolicy="no-referrer"
              className="object-cover object-center opacity-75"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#040807] via-[#040807]/55 to-[#040807]/30" />

            {/* Top Forensic Ledger Verification Strip */}
            <div className="absolute inset-x-3 top-3 rounded-xl bg-[#0A110F]/85 backdrop-blur-xl border border-white/[0.08] border-t-emerald-400/25 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-emerald-300 font-semibold">
                  Forensic Closing File Check
                </span>
                <span className="text-slate-400">
                  ALTA / CD Reconciliation
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-[#040807]/85 border border-white/[0.06] px-2.5 py-2">
                  <div className="text-slate-400 text-[11px]">Split Drift</div>
                  <div className="font-mono tabular-nums text-rose-400 font-semibold mt-0.5">
                    -$1,840
                  </div>
                </div>
                <div className="rounded-lg bg-[#040807]/85 border border-white/[0.06] px-2.5 py-2">
                  <div className="text-slate-400 text-[11px]">Referral AR</div>
                  <div className="font-mono tabular-nums text-amber-300 font-semibold mt-0.5">
                    -$2,750
                  </div>
                </div>
                <div className="rounded-lg bg-[#040807]/85 border border-white/[0.06] px-2.5 py-2">
                  <div className="text-slate-400 text-[11px]">Admin Fee</div>
                  <div className="font-mono tabular-nums text-rose-400 font-semibold mt-0.5">
                    -$495
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Frosted-Glass KPI Overlays */}
            <div className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-2 sm:gap-3">
              {/* Overlay 1: -80% */}
              <div className="rounded-xl bg-[#0A110F]/85 backdrop-blur-xl border border-white/[0.08] border-t-emerald-400/25 p-3">
                <div className="text-lg sm:text-2xl font-mono font-bold text-emerald-400 tabular-nums">
                  <AnimatedNumber value={-80} suffix="%" />
                </div>
                <div className="text-[11px] font-medium text-slate-200 truncate">
                  Unclaimed Leaks
                </div>
                <div className="mt-2.5 h-6 flex items-end gap-1">
                  {MINI_BARS_LEAD.map((height, i) => (
                    <motion.span
                      key={i}
                      initial={{ scaleY: 0.25 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.55, delay: 0.1 + i * 0.05 }}
                      style={{ height: `${height}%` }}
                      className="flex-1 origin-bottom rounded-t-sm bg-emerald-400/75"
                    />
                  ))}
                </div>
              </div>

              {/* Overlay 2: 48h Written */}
              <div className="rounded-xl bg-[#0A110F]/85 backdrop-blur-xl border border-white/[0.08] border-t-emerald-400/25 p-3">
                <div className="text-lg sm:text-2xl font-mono font-bold text-emerald-400 tabular-nums">
                  <AnimatedNumber value={48} suffix="h" />
                </div>
                <div className="text-[11px] font-medium text-slate-200 truncate">
                  Written Delivery
                </div>
                <div className="mt-2.5 h-6 flex items-end gap-1">
                  {MINI_BARS_SPEED.map((height, i) => (
                    <motion.span
                      key={i}
                      initial={{ scaleY: 0.25 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.55, delay: 0.15 + i * 0.05 }}
                      style={{ height: `${height}%` }}
                      className="flex-1 origin-bottom rounded-t-sm bg-emerald-400/90"
                    />
                  ))}
                </div>
              </div>

              {/* Overlay 3: $4,000+/mo */}
              <div className="rounded-xl bg-[#0A110F]/85 backdrop-blur-xl border border-white/[0.08] border-t-emerald-400/25 p-3">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-base sm:text-xl font-mono font-bold text-emerald-400 tabular-nums truncate">
                    $<AnimatedNumber value={4000} suffix="+" />
                    <span className="text-xs font-sans font-normal">/mo</span>
                  </span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0 hidden sm:block" />
                </div>
                <div className="text-[11px] font-medium text-slate-200 truncate">
                  Recovered GCI
                </div>
                <div className="mt-2.5 h-6 flex items-end gap-1">
                  {MINI_BARS_RECOVERED.map((height, i) => (
                    <motion.span
                      key={i}
                      initial={{ scaleY: 0.25 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.55, delay: 0.2 + i * 0.05 }}
                      style={{ height: `${height}%` }}
                      className="flex-1 origin-bottom rounded-t-sm bg-gradient-to-t from-emerald-500/50 to-emerald-300/90"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </GlassSpotlightCard>
      </ScrollReveal>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Infrastructure / Protocol Pillars (4 Glass Cards + UI Previews)           */
/* -------------------------------------------------------------------------- */

const PROTOCOL_PILLARS = [
  {
    code: 'PR-01',
    title: 'Split & Cap Audit',
    description:
      'Reconciles agent split tiers and anniversary caps against every closing disclosure.',
    statusIcon: CheckCircle2,
    statusText: '$950 – $2,400 / deal',
    badgeIcon: ShieldCheck,
    previewTitle: 'Cap Ledger Check',
    previewRows: [
      { label: 'Tier Applied', value: '80/20 Early', tone: 'text-rose-400' },
      { label: 'Verified Split', value: '70/30 Cap', tone: 'text-emerald-400' },
    ],
  },
  {
    code: 'PR-02',
    title: 'Referral Receivables',
    description:
      'Flags omitted outbound relocation & partner referral deductions prior to close.',
    statusIcon: Clock,
    statusText: '20% – 35% of side GCI',
    badgeIcon: FileCheck2,
    previewTitle: 'Referral AR Guard',
    previewRows: [
      { label: 'Relocation Fee', value: '25% Due', tone: 'text-amber-300' },
      { label: 'Invoice Status', value: 'Auto-Flagged', tone: 'text-emerald-400' },
    ],
  },
  {
    code: 'PR-03',
    title: 'CD & Fee Reconciliation',
    description:
      'Catches waived compliance fees and ALTA settlement statement mismatches.',
    statusIcon: Layers,
    statusText: '$395 – $695 / side',
    badgeIcon: FileText,
    previewTitle: 'ALTA Statement Diff',
    previewRows: [
      { label: 'Admin Fee', value: '-$495 Waived', tone: 'text-rose-400' },
      { label: 'Sign-Off', value: 'Missing Rule', tone: 'text-emerald-400' },
    ],
  },
  {
    code: 'PR-04',
    title: 'Overrides & E&O Audit',
    description:
      'Verifies team override tiers, E&O deductions, and franchise fees across ALTA statements.',
    statusIcon: ShieldCheck,
    statusText: '$420 – $1,350 / deal',
    badgeIcon: ShieldCheck,
    previewTitle: 'Override Reconciliation',
    previewRows: [
      { label: 'Override Tier', value: '10% Variance', tone: 'text-rose-400' },
      { label: 'Ledger Check', value: 'Clawback Logged', tone: 'text-emerald-400' },
    ],
  },
] as const;

export function InfrastructurePillarsSection() {
  return (
    <section id="protocol" className="scroll-mt-20 space-y-8">
      <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-400">
            Section 03 · Forensic Coverage Matrix
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.03em] text-white">
            Commission &amp; Closing{' '}
            <span className="text-emerald-400">Audit Protocol</span>
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          4 verification classes reconciled per transaction
        </span>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {PROTOCOL_PILLARS.map((pillar, idx) => {
          const BadgeIcon = pillar.badgeIcon;
          const StatusIcon = pillar.statusIcon;
          return (
            <ScrollReveal key={pillar.code} delay={idx * 0.08}>
              <GlassSpotlightCard className="p-4 h-full flex flex-col">
                {/* Rounded Top Visual UI Preview */}
                <div className="rounded-xl bg-[#040807]/85 border border-white/[0.08] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                    <span>{pillar.previewTitle}</span>
                    <span className="font-mono text-emerald-400">{pillar.code}</span>
                  </div>
                  <div className="space-y-1.5">
                    {pillar.previewRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between rounded-md bg-[#0A110F]/90 border border-white/[0.06] px-2.5 py-1.5 text-[11px]"
                      >
                        <span className="text-slate-400">{row.label}</span>
                        <span className={`font-mono tabular-nums font-semibold ${row.tone}`}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Centered Subtle Emerald Icon Badge */}
                <div className="-mt-5 mb-3 flex justify-center relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-[#0A110F] border border-white/[0.1] border-t-emerald-400/35 shadow-[0_6px_18px_rgba(0,0,0,0.45)] flex items-center justify-center text-emerald-400">
                    <BadgeIcon className="w-5 h-5" />
                  </div>
                </div>

                {/* Title & Description */}
                <div className="text-center space-y-2 flex-1 px-1">
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                {/* Bottom Status Metric Bar */}
                <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-center gap-1.5 text-xs font-mono text-emerald-300 tabular-nums">
                  <StatusIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{pillar.statusText}</span>
                </div>
              </GlassSpotlightCard>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Anonymized Forensic Brokerage Audit Snapshots (#results)                  */
/* -------------------------------------------------------------------------- */

export function RealResultsSection() {
  return (
    <section id="results" className="scroll-mt-20 space-y-8">
      <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-medium text-slate-400">
            Section 04 · Verified Forensic Breakdowns
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-white [text-wrap:balance]">
            Anonymized Brokerage{' '}
            <span className="text-emerald-400">Audit Snapshots.</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Line-by-line commission leakage recovered across US residential
            brokerages from split drift, uncollected referral receivables, and
            waived admin fees.
          </p>
        </div>
        <span className="text-xs font-medium text-emerald-300/90 shrink-0">
          All brokerage identities protected under mutual NDA
        </span>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {ANONYMIZED_AUDIT_SNAPSHOTS.map((snapshot, idx) => (
          <ScrollReveal key={snapshot.id} delay={idx * 0.08} className="h-full">
            <GlassSpotlightCard className="p-5 sm:p-6 h-full flex flex-col justify-between gap-5">
              <div className="space-y-5">
                {/* Header & Brokerage Profile */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                    <span className="font-mono text-emerald-400/90 font-semibold">
                      {snapshot.fileCode}
                    </span>
                    <span>{snapshot.reviewWindow}</span>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold tracking-[-0.02em] text-white">
                      {snapshot.brokerageProfile}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <span>
                        <span className="font-mono tabular-nums text-slate-300">
                          {snapshot.agentCount}
                        </span>{' '}
                        Agents
                      </span>
                      <span aria-hidden="true" className="text-white/20">
                        ·
                      </span>
                      <span>
                        <span className="font-mono tabular-nums text-slate-300">
                          {snapshot.closedSides}
                        </span>{' '}
                        Closed Sides Audited
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Recovered Total */}
                <div className="pt-4 border-t border-white/[0.08] flex items-baseline justify-between gap-3">
                  <span className="text-xs font-medium text-slate-400">
                    Total Leakage Recovered
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tracking-tight tabular-nums">
                    +{formatSnapshotUsd(snapshot.totalRecovered)}
                  </div>
                </div>

                {/* Clean Tabular Breakdown */}
                <div className="overflow-x-auto">
                  <table
                    aria-label={`${snapshot.brokerageProfile} leakage breakdown`}
                    className="w-full text-left border-collapse"
                  >
                    <thead>
                      <tr className="border-b border-white/[0.08] text-[11px] font-medium text-slate-400">
                        <th className="py-2 pr-3 font-medium">
                          Leakage Category
                        </th>
                        <th className="py-2 pl-3 font-medium text-right">
                          Recovered
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-xs">
                      <tr>
                        <td className="py-2.5 pr-3 align-top">
                          <div className="font-medium text-slate-100">
                            Split Drift
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {snapshot.splitDriftNote}
                          </div>
                        </td>
                        <td className="py-2.5 pl-3 text-right align-top font-mono font-semibold text-white tabular-nums whitespace-nowrap">
                          {formatSnapshotUsd(snapshot.splitDrift)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-3 align-top">
                          <div className="font-medium text-slate-100">
                            Uncollected Referrals
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {snapshot.uncollectedReferralsNote}
                          </div>
                        </td>
                        <td className="py-2.5 pl-3 text-right align-top font-mono font-semibold text-white tabular-nums whitespace-nowrap">
                          {formatSnapshotUsd(snapshot.uncollectedReferrals)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-3 align-top">
                          <div className="font-medium text-slate-100">
                            Waived Admin Fees
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {snapshot.waivedAdminFeesNote}
                          </div>
                        </td>
                        <td className="py-2.5 pl-3 text-right align-top font-mono font-semibold text-white tabular-nums whitespace-nowrap">
                          {formatSnapshotUsd(snapshot.waivedAdminFees)}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-white/[0.12] text-xs">
                        <td className="pt-3 pr-3 font-semibold text-emerald-300">
                          Net Recovered Total
                        </td>
                        <td className="pt-3 pl-3 text-right font-mono font-bold text-emerald-400 tabular-nums whitespace-nowrap">
                          {formatSnapshotUsd(snapshot.totalRecovered)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Explicit Mutual NDA Notice */}
              <div className="pt-3.5 border-t border-white/[0.08] flex items-center gap-2 text-xs text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                <span>{snapshot.ndaNotice}</span>
              </div>
            </GlassSpotlightCard>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Comparison Section (Old Brokerage Way vs Zed Automation)                  */
/* -------------------------------------------------------------------------- */

const OLD_WAY_ITEMS = [
  'Manual closing spreadsheet checks',
  'Unaudited split tier & cap drift',
  'Waived compliance fees & missed referrals',
] as const;

const ZED_WAY_ITEMS = [
  'Line-by-line split tier & cap verification',
  'Automated ALTA / CD & referral fee audit',
  '48-hour written PDF recovery ledger — zero calls',
] as const;

export function ComparisonSection() {
  return (
    <section id="comparison" className="space-y-8">
      <ScrollReveal className="text-center max-w-2xl mx-auto space-y-2.5">
        <div className="text-xs font-medium text-slate-400">
          Section 05 · Operational Comparison
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-white">
          Manual Spreadsheets Drain Margin.{' '}
          <span className="text-emerald-400">Zed Automation Audits Async.</span>
        </h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Old Brokerage Way: Muted Matte Glass */}
        <ScrollReveal>
          <GlassSpotlightCard variant="muted" className="p-6 sm:p-7 h-full">
            <div className="flex items-start justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div className="inline-flex items-center gap-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3.5 py-2">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs font-semibold tracking-tight text-slate-200">
                  Old Brokerage Way
                </span>
              </div>

              <div className="relative h-16 w-28 rounded-lg overflow-hidden border border-white/[0.1] shrink-0">
                <Image
                  src="/images/old-way-desk.jpg"
                  alt="Cluttered manual commission paperwork desk"
                  fill
                  sizes="112px"
                  referrerPolicy="no-referrer"
                  className="object-cover opacity-85"
                />
              </div>
            </div>

            <ul className="mt-6 space-y-3.5">
              {OLD_WAY_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.025] border border-white/[0.06] px-4 py-3 text-sm text-slate-300"
                >
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </GlassSpotlightCard>
        </ScrollReveal>

        {/* Zed Automation: Top-Lit Emerald Hairline Surface */}
        <ScrollReveal delay={0.1}>
          <GlassSpotlightCard
            variant="emerald"
            borderBeam={true}
            className="p-6 sm:p-7 h-full"
          >
            <div className="flex items-start justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div className="inline-flex items-center gap-2.5 rounded-lg bg-emerald-500/12 border border-emerald-400/25 px-3.5 py-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold tracking-tight text-emerald-300">
                  Zed Automation
                </span>
              </div>

              <div className="relative h-16 w-28 rounded-lg overflow-hidden border border-white/[0.12] shrink-0">
                <Image
                  src="/images/office-backdrop.jpg"
                  alt="Zed Automation obsidian-emerald brokerage audit suite"
                  fill
                  sizes="112px"
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              </div>
            </div>

            <ul className="mt-6 space-y-3.5">
              {ZED_WAY_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-emerald-500/[0.06] border border-white/[0.08] px-4 py-3 text-sm font-medium text-white"
                >
                  <span className="h-5 w-5 rounded-full bg-emerald-400 text-[#040807] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </GlassSpotlightCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
