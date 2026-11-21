'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Play,
  SlidersHorizontal,
  Video,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AnimatedNumber,
  GlassSpotlightCard,
  MagneticButton,
  ParallaxPhoto,
  ScrollReveal,
} from '@/components/landing/MotionPrimitives';
import {
  buildLeakageAuditBriefNote,
  calculateBrokerageLeakage,
  formatCurrencyWhole,
} from '@/lib/commission-audit/leakage-tool';

const SAMPLE_CSV_ROWS = [
  { deal: '412 Oak Ridge Dr', paid: '$11,640', verified: '$10,185', delta: '-$1,455' },
  { deal: '1904 Pinehurst Ave', paid: '$15,500', verified: '$11,625', delta: '-$3,875' },
  { deal: '88 Maplewood Ln', paid: '$9,855', verified: '$9,360', delta: '-$495' },
] as const;

export default function LeakageAuditTool({
  onRequestAuditWithNote,
}: {
  onRequestAuditWithNote: (note: string) => void;
}) {
  const [monthlyClosedSides, setMonthlyClosedSides] = useState<number>(24);
  const [averageCommission, setAverageCommission] = useState<number>(9500);
  const [agentCount, setAgentCount] = useState<number>(32);
  const [loomPreviewOpen, setLoomPreviewOpen] = useState<boolean>(false);

  const estimate = useMemo(
    () =>
      calculateBrokerageLeakage({
        monthlyClosedSides,
        averageCommission,
        agentCount,
      }),
    [monthlyClosedSides, averageCommission, agentCount],
  );

  const handleRunAudit = () => {
    const note = buildLeakageAuditBriefNote(
      { monthlyClosedSides, averageCommission, agentCount },
      estimate,
    );
    onRequestAuditWithNote(note);
  };

  return (
    <section id="tool" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <ScrollReveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-3 max-w-3xl">
            <div className="text-xs font-medium text-emerald-300/90">
              Interactive SaaS Diagnostic · Real-Time Brokerage Leakage Model
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] leading-[1.06] text-white [text-wrap:balance]">
              Try the Brokerage{' '}
              <span className="text-[#34D399]">
                Commission Leakage Audit Tool
              </span>
            </h2>
          </div>
          <p className="text-sm text-[#9CA3AF] max-w-md leading-relaxed">
            Dial in your closing volume, average commission per side, and agent
            roster to see what split drift, missed referrals, and waived fees
            cost your brokerage every quarter.
          </p>
        </ScrollReveal>

        {/* Core Product Row: Glass SaaS Calculator Window + Broker Laptop Photo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Screenshot-Style Glass SaaS Calculator Window */}
          <ScrollReveal className="lg:col-span-7">
            <GlassSpotlightCard
              borderBeam={true}
              tilt={false}
              className="h-full flex flex-col justify-between"
            >
              {/* SaaS Window Chrome Bar */}
              <div className="px-5 sm:px-7 py-4 border-b border-emerald-500/15 bg-[#050807]/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <SlidersHorizontal className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-white truncate">
                    Brokerage Commission Leakage Audit Tool
                  </span>
                </div>
                <span className="text-xs text-[#9CA3AF] whitespace-nowrap shrink-0">
                  <span className="font-mono font-semibold text-emerald-300 tabular-nums">
                    {formatCurrencyWhole(estimate.monthlyGrossGci)}
                  </span>{' '}
                  / mo GCI
                </span>
              </div>

              <div className="p-5 sm:p-7 space-y-7 flex-1 flex flex-col justify-between">
                {/* 3 Interactive Sliders */}
                <div className="space-y-6">
                  {/* Slider 1: Monthly Closed Sides */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="tool-monthly-sides"
                        className="text-sm font-medium text-slate-200"
                      >
                        Monthly Closed Sides
                      </label>
                      <span className="font-mono text-base font-bold text-[#34D399] tabular-nums">
                        {monthlyClosedSides} sides / mo
                      </span>
                    </div>
                    <input
                      id="tool-monthly-sides"
                      type="range"
                      min={5}
                      max={120}
                      step={1}
                      value={monthlyClosedSides}
                      onChange={(e) =>
                        setMonthlyClosedSides(Number(e.target.value))
                      }
                      className="zed-slider w-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-[#9CA3AF] tabular-nums">
                      <span>5 sides</span>
                      <span>60 sides</span>
                      <span>120 sides</span>
                    </div>
                  </div>

                  {/* Slider 2: Average Commission */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="tool-avg-commission"
                        className="text-sm font-medium text-slate-200"
                      >
                        Average Commission
                      </label>
                      <span className="font-mono text-base font-bold text-[#34D399] tabular-nums">
                        {formatCurrencyWhole(averageCommission)} / side
                      </span>
                    </div>
                    <input
                      id="tool-avg-commission"
                      type="range"
                      min={3500}
                      max={25000}
                      step={250}
                      value={averageCommission}
                      onChange={(e) =>
                        setAverageCommission(Number(e.target.value))
                      }
                      className="zed-slider w-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-[#9CA3AF] tabular-nums">
                      <span>$3,500</span>
                      <span>$14,000</span>
                      <span>$25,000</span>
                    </div>
                  </div>

                  {/* Slider 3: Agent Count */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="tool-agent-count"
                        className="text-sm font-medium text-slate-200"
                      >
                        Agent Count
                      </label>
                      <span className="font-mono text-base font-bold text-[#34D399] tabular-nums">
                        {agentCount} agents
                      </span>
                    </div>
                    <input
                      id="tool-agent-count"
                      type="range"
                      min={5}
                      max={150}
                      step={1}
                      value={agentCount}
                      onChange={(e) => setAgentCount(Number(e.target.value))}
                      className="zed-slider w-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-[#9CA3AF] tabular-nums">
                      <span>5 agents</span>
                      <span>75 agents</span>
                      <span>150 agents</span>
                    </div>
                  </div>
                </div>

                {/* Live Glowing Result Panel */}
                <div className="relative rounded-2xl bg-[#050807]/90 border border-emerald-400/35 p-5 sm:p-6 shadow-[0_0_42px_rgba(16,185,129,0.2)] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-emerald-300">
                        Estimated Leakage This Quarter
                      </div>
                      <div
                        data-testid="quarterly-leakage-readout"
                        className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-[#34D399] drop-shadow-[0_0_24px_rgba(16,185,129,0.45)]"
                      >
                        <AnimatedNumber
                          value={estimate.quarterlyEstimatedLeakage}
                          prefix="$"
                        />
                      </div>
                    </div>
                    <div className="sm:text-right space-y-0.5">
                      <div className="text-xs text-[#9CA3AF]">
                        Annualized Exposure
                      </div>
                      <div className="font-mono text-xl font-bold text-white tabular-nums">
                        <AnimatedNumber
                          value={estimate.annualEstimatedLeakage}
                          prefix="$"
                        />
                        <span className="text-xs font-sans font-normal text-[#9CA3AF]">
                          {' '}
                          / yr
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3-Column Live Breakdown */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.08]">
                    <div>
                      <div className="text-[11px] text-[#9CA3AF]">
                        Split Drift
                      </div>
                      <div className="mt-0.5 font-mono text-sm sm:text-base font-semibold text-white tabular-nums">
                        {formatCurrencyWhole(estimate.quarterlySplitDrift)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#9CA3AF]">
                        Uncollected Referrals
                      </div>
                      <div className="mt-0.5 font-mono text-sm sm:text-base font-semibold text-white tabular-nums">
                        {formatCurrencyWhole(
                          estimate.quarterlyUncollectedReferrals,
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#9CA3AF]">
                        Waived Admin Fees
                      </div>
                      <div className="mt-0.5 font-mono text-sm sm:text-base font-semibold text-white tabular-nums">
                        {formatCurrencyWhole(estimate.quarterlyWaivedFees)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <MagneticButton className="w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleRunAudit}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#050807] font-bold text-sm h-12 px-6 shadow-[0_0_32px_rgba(16,185,129,0.4)] transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap"
                      >
                        Run My Free 3-Deal Audit
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </button>
                    </MagneticButton>
                    <span className="text-xs text-[#9CA3AF]">
                      PDF + CSV + Loom in 48h · Zero calls
                    </span>
                  </div>
                </div>
              </div>
            </GlassSpotlightCard>
          </ScrollReveal>

          {/* Right Column: Editorial Photo of Broker Checking Laptop + Live Audit Scope Overlay */}
          <ScrollReveal delay={0.1} className="lg:col-span-5">
            <div className="relative h-full min-h-[420px] rounded-[20px] overflow-hidden border border-emerald-500/25 shadow-[0_24px_60px_rgba(0,0,0,0.55),0_0_36px_rgba(16,185,129,0.12)] flex flex-col justify-end">
              <ParallaxPhoto
                src="/images/diagnostic-ops.jpg"
                alt="Managing broker checking commission audit diagnostics on a laptop in a modern office"
                className="absolute inset-0 w-full h-full"
                imgClassName="object-top"
                sizes="(max-width: 1024px) 100vw, 520px"
                strength={16}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050807] via-[#050807]/45 to-transparent"
              />

              <div className="relative z-10 p-5 sm:p-6 space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-[#34D399]">
                    Live Forensic Projection
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Built for Managing Brokers Who Want Exact Dollar Proof
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#050807]/85 backdrop-blur-xl border border-emerald-500/25 p-4">
                  <div>
                    <div className="text-[11px] text-[#9CA3AF]">
                      Quarterly Volume Modeled
                    </div>
                    <div className="mt-1 font-mono text-lg font-bold text-white tabular-nums">
                      {formatCurrencyWhole(estimate.quarterlyGrossGci)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#9CA3AF]">
                      Est. Flagged Closings
                    </div>
                    <div className="mt-1 font-mono text-lg font-bold text-[#34D399] tabular-nums">
                      {estimate.estimatedFlaggedFilesPerQuarter} files / qtr
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Deliverables Product Showcase: Executive PDF, Line-by-Line CSV, Loom Walkthrough */}
        <div className="space-y-6 pt-4">
          <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-emerald-300/90">
                What Lands in Your Inbox Within 48 Hours
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-white">
                Three Concrete Audit Deliverables. Zero Meetings.
              </h3>
            </div>
            <span className="text-xs text-[#9CA3AF]">
              Included free on every 3-deal diagnostic
            </span>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* 1. Executive PDF Summary Visual Mockup */}
            <ScrollReveal delay={0.04}>
              <GlassSpotlightCard className="h-full p-5 sm:p-6 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/12 border border-emerald-400/30 flex items-center justify-center text-[#34D399] shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        Executive PDF Summary
                      </h4>
                      <div className="text-xs text-[#9CA3AF]">
                        Confidential Report (.pdf)
                      </div>
                    </div>
                  </div>

                  {/* Visual PDF Page Mockup */}
                  <div className="rounded-xl bg-[#050807]/90 border border-white/[0.08] p-4 space-y-3">
                    <div className="flex items-center justify-between text-[11px] pb-2 border-b border-white/[0.08]">
                      <span className="font-semibold text-white">
                        ZED Forensic GCI Brief
                      </span>
                      <span className="font-mono text-[#34D399] tabular-nums">
                        +$22,335
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#9CA3AF]">Split Drift</span>
                          <span className="font-mono text-white tabular-nums">
                            48%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/[0.07] overflow-hidden">
                          <div className="h-full w-[48%] rounded-full bg-[#10B981]" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#9CA3AF]">
                            Uncollected Referrals
                          </span>
                          <span className="font-mono text-white tabular-nums">
                            36%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/[0.07] overflow-hidden">
                          <div className="h-full w-[36%] rounded-full bg-[#34D399]" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#9CA3AF]">Waived Fees</span>
                          <span className="font-mono text-white tabular-nums">
                            16%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/[0.07] overflow-hidden">
                          <div className="h-full w-[16%] rounded-full bg-teal-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Board-ready summary categorizing total leakage by root cause,
                  agent cap variance, and prioritized clawback steps.
                </p>
              </GlassSpotlightCard>
            </ScrollReveal>

            {/* 2. Line-by-Line Discrepancy CSV Visual Mockup */}
            <ScrollReveal delay={0.08}>
              <GlassSpotlightCard className="h-full p-5 sm:p-6 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/12 border border-emerald-400/30 flex items-center justify-center text-[#34D399] shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        Line-by-Line Discrepancy CSV
                      </h4>
                      <div className="text-xs text-[#9CA3AF]">
                        Accounting Ledger (.csv)
                      </div>
                    </div>
                  </div>

                  {/* Visual CSV Spreadsheet Mockup */}
                  <div className="rounded-xl bg-[#050807]/90 border border-white/[0.08] overflow-hidden">
                    <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-emerald-500/10 border-b border-white/[0.08] text-[10px] font-medium text-emerald-300">
                      <span className="col-span-2">Property</span>
                      <span className="text-right">Paid</span>
                      <span className="text-right">Delta</span>
                    </div>
                    <div className="divide-y divide-white/[0.06] text-[11px]">
                      {SAMPLE_CSV_ROWS.map((row) => (
                        <div
                          key={row.deal}
                          className="grid grid-cols-4 gap-2 px-3 py-2.5 items-center"
                        >
                          <span className="col-span-2 text-slate-200 truncate">
                            {row.deal}
                          </span>
                          <span className="text-right font-mono text-[#9CA3AF] tabular-nums">
                            {row.paid}
                          </span>
                          <span className="text-right font-mono font-semibold text-rose-400 tabular-nums">
                            {row.delta}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Every audited deal mapped row-by-row: paid payout vs.
                  contracted split tier, referral fee, and admin charge.
                </p>
              </GlassSpotlightCard>
            </ScrollReveal>

            {/* 3. Private Loom Walkthrough Video Thumbnail Mockup */}
            <ScrollReveal delay={0.12}>
              <GlassSpotlightCard className="h-full p-5 sm:p-6 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/12 border border-emerald-400/30 flex items-center justify-center text-[#34D399] shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        Private Loom Walkthrough
                      </h4>
                      <div className="text-xs text-[#9CA3AF]">
                        Async Video Briefing (5–7 min)
                      </div>
                    </div>
                  </div>

                  {/* Interactive Loom Video Thumbnail with Play Button */}
                  <button
                    type="button"
                    onClick={() => setLoomPreviewOpen(true)}
                    aria-label="Preview sample Private Loom Walkthrough breakdown"
                    className="group/play relative block w-full aspect-[16/10] rounded-xl overflow-hidden border border-emerald-400/30 text-left cursor-pointer"
                  >
                    <Image
                      src="/images/coverage-override-chart.jpg"
                      alt="Private Loom audit walkthrough video thumbnail"
                      fill
                      sizes="(max-width: 1024px) 100vw, 360px"
                      referrerPolicy="no-referrer"
                      className="object-cover transition-transform duration-500 group-hover/play:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#050807]/90 via-[#050807]/35 to-transparent"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="h-13 w-13 rounded-full bg-[#10B981] group-hover/play:bg-[#34D399] text-[#050807] flex items-center justify-center shadow-[0_0_32px_rgba(16,185,129,0.65)] transition-transform duration-200 group-hover/play:scale-110">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </span>
                    </div>
                    <div className="absolute inset-x-3 bottom-2.5 flex items-center justify-between text-[11px] text-white">
                      <span className="font-medium">
                        3-Deal Forensic Walkthrough
                      </span>
                      <span className="font-mono text-emerald-300 tabular-nums">
                        06:14
                      </span>
                    </div>
                  </button>
                </div>

                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Password-isolated screen briefing stepping through each
                  flagged Closing Disclosure so you review asynchronously.
                </p>
              </GlassSpotlightCard>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Interactive Sample Loom Walkthrough Preview Modal */}
      <Dialog open={loomPreviewOpen} onOpenChange={setLoomPreviewOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0A0F0D]/95 backdrop-blur-2xl text-white border border-emerald-500/30 shadow-[0_24px_70px_rgba(0,0,0,0.7),0_0_40px_rgba(16,185,129,0.16)]">
          <DialogHeader className="text-left space-y-2">
            <div className="text-xs font-medium text-[#34D399]">
              Sample Async Loom Briefing · 06:14 · Zero Live Calls
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              Inside Your Private 48-Hour Loom Walkthrough
            </DialogTitle>
            <DialogDescription className="text-sm text-[#9CA3AF]">
              Every 3-deal audit includes a chaptered private screen walkthrough
              covering the exact Closing Disclosure lines where GCI leaked.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {[
              {
                time: '00:00 – 01:45',
                title: 'Executive Recovery Total & Cap Status',
                detail:
                  'Overview of total leakage across your 3 submitted files ($7,445 sample variance) and annualized margin impact.',
              },
              {
                time: '01:45 – 04:20',
                title: 'Closing Disclosure vs. Split Ledger Side-by-Side',
                detail:
                  'Line-by-line review of premature 80/20 post-cap drift, missing 25% outbound referral fee, and waived $495 compliance fee.',
              },
              {
                time: '04:20 – 06:14',
                title: 'Clawback Script & Accounting Remediation',
                detail:
                  'Exact accounting entries to recover funds cleanly and lock future payouts before ACH release.',
              },
            ].map((chapter) => (
              <div
                key={chapter.time}
                className="rounded-xl bg-[#050807]/85 border border-emerald-500/20 p-3.5 flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-semibold text-[#34D399] tabular-nums">
                      {chapter.time}
                    </span>
                    <span className="font-semibold text-white">
                      {chapter.title}
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    {chapter.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setLoomPreviewOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Close Preview
            </button>
            <button
              type="button"
              onClick={() => {
                setLoomPreviewOpen(false);
                handleRunAudit();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#050807] text-xs font-bold transition-colors cursor-pointer"
            >
              Run My Free 3-Deal Audit
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
