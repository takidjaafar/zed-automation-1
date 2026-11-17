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
  ShieldCheck,
  Star,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  AnimatedNumber,
  GlassSpotlightCard,
  MagneticButton,
  ScrollReveal,
} from '@/components/landing/MotionPrimitives';

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
        <div className="text-xs font-mono uppercase tracking-[0.16em] text-emerald-300/90">
          Section 01 · Diagnostic · Audit &amp; Lead Capture
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-[-0.03em] leading-[1.08] text-white">
          You Don&apos;t Have a Volume Problem.{' '}
          <span className="text-emerald-400">
            You Have a Commission Leakage Problem.
          </span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
          Every month, silent split drift, uncollected outbound referral fees,
          waived compliance charges, and slow inbound lead follow-up drain
          brokerage net margin. Zed Automation reconciles every closing line
          and automates sub-90-second written lead capture asynchronously.
        </p>

        <div className="pt-1 flex flex-wrap items-center gap-4">
          <MagneticButton>
            <button
              type="button"
              onClick={onScrollToSandbox}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B1210]/85 border border-emerald-400/35 hover:border-emerald-400/70 text-white px-5 h-11 text-sm font-semibold shadow-[0_0_24px_rgba(16,185,129,0.16)] transition-colors cursor-pointer whitespace-nowrap"
            >
              See How We Stop the Leak
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </MagneticButton>
          <span className="text-xs font-mono text-slate-400">
            100% written audit · Zero live meetings
          </span>
        </div>
      </ScrollReveal>

      {/* Right Vertical Glass-Framed Photo + 3 Frosted KPI Sparkline Overlays */}
      <ScrollReveal delay={0.12} className="lg:col-span-6">
        <GlassSpotlightCard
          tilt={true}
          className="p-2 sm:p-3 rounded-3xl"
        >
          <div className="relative h-[430px] sm:h-[490px] w-full rounded-2xl overflow-hidden border border-emerald-400/20">
            <Image
              src="/images/diagnostic-ops.jpg"
              alt="Brokerage operations director reviewing commission ledgers"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              referrerPolicy="no-referrer"
              className="object-cover object-top"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#040807] via-[#040807]/30 to-transparent" />

            {/* 3 Frosted-Glass KPI Overlays */}
            <div className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-2 sm:gap-3">
              {/* Overlay 1: -80% */}
              <div className="rounded-xl bg-[#0B1210]/80 backdrop-blur-xl border border-emerald-400/25 p-3 shadow-[0_0_24px_rgba(16,185,129,0.15)]">
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
                      className="flex-1 origin-bottom rounded-t-sm bg-emerald-400/80"
                    />
                  ))}
                </div>
              </div>

              {/* Overlay 2: 76% */}
              <div className="rounded-xl bg-[#0B1210]/80 backdrop-blur-xl border border-emerald-400/25 p-3 shadow-[0_0_24px_rgba(16,185,129,0.15)]">
                <div className="text-lg sm:text-2xl font-mono font-bold text-emerald-400 tabular-nums">
                  <AnimatedNumber value={76} suffix="%" />
                </div>
                <div className="text-[11px] font-medium text-slate-200 truncate">
                  Faster Response
                </div>
                <div className="mt-2.5 h-6 flex items-end gap-1">
                  {MINI_BARS_SPEED.map((height, i) => (
                    <motion.span
                      key={i}
                      initial={{ scaleY: 0.25 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.55, delay: 0.15 + i * 0.05 }}
                      style={{ height: `${height}%` }}
                      className="flex-1 origin-bottom rounded-t-sm bg-emerald-400"
                    />
                  ))}
                </div>
              </div>

              {/* Overlay 3: $4,000+/mo */}
              <div className="rounded-xl bg-[#0B1210]/80 backdrop-blur-xl border border-emerald-400/25 p-3 shadow-[0_0_24px_rgba(16,185,129,0.15)]">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-base sm:text-xl font-mono font-bold text-emerald-400 tabular-nums truncate">
                    $<AnimatedNumber value={4000} suffix="+" />
                    <span className="text-xs font-normal">/mo</span>
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
                      className="flex-1 origin-bottom rounded-t-sm bg-gradient-to-t from-emerald-500/60 to-emerald-300"
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
    title: 'Async Speed-to-Lead',
    description:
      'Captures and qualifies inbound brokerage leads via automated SMS & email under 90s.',
    statusIcon: Zap,
    statusText: '<90s Avg Response',
    badgeIcon: Zap,
    previewTitle: 'Written Lead Dispatch',
    previewRows: [
      { label: 'SMS + Email', value: '38s Sent', tone: 'text-emerald-400' },
      { label: '90d GCI Uplift', value: '18% – 27%', tone: 'text-emerald-300' },
    ],
  },
] as const;

export function InfrastructurePillarsSection() {
  return (
    <section id="audit-protocol" className="space-y-8">
      <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-[0.16em] text-slate-400">
            Section 03 · Forensic Coverage Matrix
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.03em] text-white">
            Commission &amp; Pipeline{' '}
            <span className="text-emerald-400">Audit Protocol</span>
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400">
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
                <div className="rounded-xl bg-[#040807]/85 border border-emerald-400/20 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    <span>{pillar.previewTitle}</span>
                    <span className="text-emerald-400">{pillar.code}</span>
                  </div>
                  <div className="space-y-1.5">
                    {pillar.previewRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between rounded-md bg-[#0B1210]/90 border border-white/[0.06] px-2.5 py-1.5 text-[11px] font-mono tabular-nums"
                      >
                        <span className="text-slate-400">{row.label}</span>
                        <span className={`font-semibold ${row.tone}`}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Centered Glowing Emerald Icon Badge */}
                <div className="-mt-5 mb-3 flex justify-center relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-[#0B1210] border border-emerald-400/45 shadow-[0_0_24px_rgba(16,185,129,0.35)] flex items-center justify-center text-emerald-400">
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
                <div className="mt-5 pt-3 border-t border-emerald-400/15 flex items-center justify-center gap-1.5 text-[11px] font-mono text-emerald-300 tabular-nums">
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
/*  Real Results / Case Studies Section (Executive Portraits + 5-Star)        */
/* -------------------------------------------------------------------------- */

const CASE_STUDIES = [
  {
    image: '/images/broker-1.jpg',
    alt: 'Managing Broker at Summit Key Realty',
    prefix: '+$',
    value: 184500,
    decimals: 0,
    suffix: '',
    label: 'Annualized GCI Recovered',
    brokerage: 'Summit Key Realty',
    quote:
      '"ZED uncovered split tier drift and omitted referral deductions across closed files we assumed were settled cleanly."',
  },
  {
    image: '/images/broker-2.jpg',
    alt: 'Brokerage Founder at Harborline Properties',
    prefix: '',
    value: 3.6,
    decimals: 1,
    suffix: 'x',
    label: '90-Day Audit Recovery Ratio',
    brokerage: 'Harborline Properties',
    quote:
      '"The written PDF audit and Loom walkthrough pinned down exact closing-disclosure errors within 48 hours."',
  },
  {
    image: '/images/broker-3.jpg',
    alt: 'Principal Broker at Northstar Realty Group',
    prefix: '$',
    value: 96400,
    decimals: 0,
    suffix: '',
    label: 'Verified Direct Clawback',
    brokerage: 'Northstar Realty Group',
    quote:
      '"Line-by-line commission reconciliation paired with automated <90s lead capture added pure net profit asynchronously."',
  },
] as const;

export function RealResultsSection() {
  return (
    <section id="real-results" className="space-y-8">
      <ScrollReveal className="text-center max-w-2xl mx-auto space-y-3">
        <div className="text-xs font-mono uppercase tracking-[0.16em] text-slate-400">
          Section 04 · Verified Recoveries
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-white">
          Real GCI <span className="text-emerald-400">Recovered.</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Verified recoveries from split audits, referral receivables, and
          transaction corrections delivered asynchronously to brokerage owners.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CASE_STUDIES.map((study, idx) => (
          <ScrollReveal key={study.brokerage} delay={idx * 0.1}>
            <GlassSpotlightCard className="p-4 sm:p-5 h-full flex flex-col justify-between">
              <div className="space-y-4">
                {/* Top Executive Portrait Frame */}
                <div className="relative h-52 w-full rounded-xl overflow-hidden border border-emerald-400/20">
                  <Image
                    src={study.image}
                    alt={study.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    referrerPolicy="no-referrer"
                    className="object-cover object-top"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1210]/70 via-transparent to-transparent" />
                </div>

                {/* Bold Recovered Metric */}
                <div className="text-center space-y-1 pt-1">
                  <div className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400 tracking-tight">
                    <AnimatedNumber
                      value={study.value}
                      prefix={study.prefix}
                      decimals={study.decimals}
                      suffix={study.suffix}
                    />
                  </div>
                  <div className="text-xs font-mono text-slate-300">
                    {study.label}
                  </div>
                </div>

                {/* Brokerage Name & Quote */}
                <div className="text-center space-y-2 pt-1">
                  <h3 className="text-base font-semibold text-white">
                    {study.brokerage}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {study.quote}
                  </p>
                </div>
              </div>

              {/* 5-Star Rating */}
              <div
                aria-label="5 out of 5 stars"
                className="pt-4 mt-4 border-t border-emerald-400/15 flex items-center justify-center gap-1 text-amber-400"
              >
                {Array.from({ length: 5 }).map((_, starIdx) => (
                  <Star
                    key={starIdx}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
            </GlassSpotlightCard>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Comparison Section (Old Brokerage Way vs Zed Automation Border Beam)      */
/* -------------------------------------------------------------------------- */

const OLD_WAY_ITEMS = [
  'Slow manual follow-up after hours',
  'Unaudited split tier & referral leaks',
  'Messy closing spreadsheet checks',
] as const;

const ZED_WAY_ITEMS = [
  '<90s automated SMS & email capture',
  'Line-by-line forensic GCI audit',
  '48-hour written PDF & Loom delivery',
] as const;

export function ComparisonSection() {
  return (
    <section id="comparison" className="space-y-8">
      <ScrollReveal className="text-center max-w-2xl mx-auto space-y-2.5">
        <div className="text-xs font-mono uppercase tracking-[0.16em] text-slate-400">
          Section 05 · Operational Comparison
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-white">
          Manual Spreadsheets Drain Margin.{' '}
          <span className="text-emerald-400">Zed Automation Audits Async.</span>
        </h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Old Brokerage Way: Muted Grey Glass */}
        <ScrollReveal>
          <GlassSpotlightCard variant="muted" className="p-6 sm:p-7 h-full">
            <div className="flex items-start justify-between gap-4 pb-6 border-b border-white/10">
              <div className="inline-flex items-center gap-2.5 rounded-lg bg-white/[0.06] border border-white/10 px-3.5 py-2">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
                  Old Brokerage Way
                </span>
              </div>

              <div className="relative h-16 w-28 rounded-lg overflow-hidden border border-white/15 shrink-0">
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

            <ul className="mt-6 space-y-4">
              {OLD_WAY_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 text-sm text-slate-300"
                >
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </GlassSpotlightCard>
        </ScrollReveal>

        {/* Zed Automation: Double-Rimmed Glowing Emerald Border + Border Beam */}
        <ScrollReveal delay={0.1}>
          <GlassSpotlightCard
            variant="emerald"
            borderBeam={true}
            className="p-6 sm:p-7 h-full ring-1 ring-emerald-400/35"
          >
            <div className="flex items-start justify-between gap-4 pb-6 border-b border-emerald-400/20">
              <div className="inline-flex items-center gap-2.5 rounded-lg bg-emerald-500/15 border border-emerald-400/35 px-3.5 py-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-300">
                  Zed Automation
                </span>
              </div>

              <div className="relative h-16 w-28 rounded-lg overflow-hidden border border-emerald-400/35 shrink-0">
                <Image
                  src="/images/zed-team.jpg"
                  alt="Modern brokerage operations team reviewing analytics"
                  fill
                  sizes="112px"
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              </div>
            </div>

            <ul className="mt-6 space-y-4">
              {ZED_WAY_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-400/20 px-4 py-3 text-sm font-medium text-white"
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
