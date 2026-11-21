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
            <div className="text-xs font-medium tracking-[0.04em] text-[#D8C8AE]">
              Interactive SaaS Diagnostic · Real-Time Brokerage Leakage Model
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] leading-[1.08] text-[#F7F3EB] [text-wrap:balance]">
              Try the Brokerage{' '}
              <span className="italic font-medium text-[#D8C8AE]">
                Commission Leakage Audit Tool
              </span>
            </h2>
          </div>
          <p className="text-sm text-[#B0ACA3] max-w-md leading-[1.7] tracking-[0.01em]">
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
              <div className="px-5 sm:px-7 py-4 border-b border-[#D8C8AE]/[0.12] bg-[#060A08]/65 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <SlidersHorizontal className="w-4 h-4 text-[#D8C8AE] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#F7F3EB] truncate">
                    Brokerage Commission Leakage Audit Tool
                  </span>
                </div>
                <span className="text-xs text-[#A8A49B] whitespace-nowrap shrink-0">
                  <span className="font-mono font-semibold text-[#D8C8AE] tabular-nums">
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
                        className="text-sm font-medium text-[#E8E2D6]"
                      >
                        Monthly Closed Sides
                      </label>
                      <span className="font-mono text-base font-semibold text-[#D8C8AE] tabular-nums">
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
                    <div className="flex justify-between text-[11px] font-mono text-[#A8A49B] tabular-nums">
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
                        className="text-sm font-medium text-[#E8E2D6]"
                      >
                        Average Commission
                      </label>
                      <span className="font-mono text-base font-semibold text-[#D8C8AE] tabular-nums">
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
                    <div className="flex justify-between text-[11px] font-mono text-[#A8A49B] tabular-nums">
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
                        className="text-sm font-medium text-[#E8E2D6]"
                      >
                        Agent Count
                      </label>
                      <span className="font-mono text-base font-semibold text-[#D8C8AE] tabular-nums">
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
                    <div className="flex justify-between text-[11px] font-mono text-[#A8A49B] tabular-nums">
                      <span>5 agents</span>
                      <span>75 agents</span>
                      <span>150 agents</span>
                    </div>
                  </div>
                </div>

                {/* Live Institutional Result Panel */}
                <div className="relative rounded-2xl bg-[#060A08]/92 border border-[#0B6B4A]/65 p-5 sm:p-6 shadow-[0_14px_34px_rgba(0,0,0,0.45)] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-[#D8C8AE]">
                        Estimated Leakage This Quarter
                      </div>
                      <div
                        data-testid="quarterly-leakage-readout"
                        className="font-mono text-4xl sm:text-5xl font-semibold tracking-tight text-[#58B38E]"
                      >
                        <AnimatedNumber
                          value={estimate.quarterlyEstimatedLeakage}
                          prefix="$"
                        />
                      </div>
                    </div>
                    <div className="sm:text-right space-y-0.5">
                      <div className="text-xs text-[#A8A49B]">
                        Annualized Exposure
                      </div>
                      <div className="font-mono text-xl font-semibold text-[#F7F3EB] tabular-nums">
                        <AnimatedNumber
                          value={estimate.annualEstimatedLeakage}
                          prefix="$"
                        />
                        <span className="text-xs font-sans font-normal text-[#A8A49B]">
                          {' '}
                          / yr
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3-Column Live Breakdown */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#D8C8AE]/[0.12]">
                    <div>
                      <div className="text-[11px] text-[#A8A49B]">
                        Split Drift
                      </div>
                      <div className="mt-0.5 font-mono text-sm sm:text-base font-semibold text-[#F7F3EB] tabular-nums">
                        {formatCurrencyWhole(estimate.quarterlySplitDrift)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#A8A49B]">
                        Uncollected Referrals
                      </div>
                      <div className="mt-0.5 font-mono text-sm sm:text-base font-semibold text-[#F7F3EB] tabular-nums">
                        {formatCurrencyWhole(
                          estimate.quarterlyUncollectedReferrals,
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#A8A49B]">
                        Waived Admin Fees
                      </div>
                      <div className="mt-0.5 font-mono text-sm sm:text-base font-semibold text-[#F7F3EB] tabular-nums">
                        {formatCurrencyWhole(estimate.quarterlyWaivedFees)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <MagneticButton className="w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleRunAudit}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B6B4A] hover:bg-[#117C57] text-[#F7F3EB] border border-[#D8C8AE]/20 font-semibold text-sm h-12 px-6 shadow-[0_10px_28px_rgba(0,0,0,0.45),0_4px_16px_rgba(11,107,74,0.28)] transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap"
                      >
                        Run My Free 3-Deal Audit
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </button>
                    </MagneticButton>
                    <span className="text-xs text-[#A8A49B]">
                      PDF + CSV + Loom in 48h · Zero calls
                    </span>
                  </div>
                </div>
              </div>
            </GlassSpotlightCard>
          </ScrollReveal>

          {/* Right Column: Editorial Photo of Broker Checking Laptop + Live Audit Scope Overlay */}
          <ScrollReveal delay={0.1} className="lg:col-span-5">
            <div className="relative h-full min-h-[420px] rounded-[20px] overflow-hidden border border-[#D8C8AE]/20 shadow-[0_24px_60px_rgba(0,0,0,0.55)] flex flex-col justify-end">
              <ParallaxPhoto
                src="/images/candid/broker-laptop.jpg"
                alt="Managing broker checking commission audit diagnostics on a laptop in a modern office"
                className="absolute inset-0 w-full h-full"
                imgClassName="object-top"
                sizes="(max-width: 1024px) 100vw, 520px"
                strength={16}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060A08] via-[#060A08]/45 to-transparent"
              />

              <div className="relative z-10 p-5 sm:p-6 space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-medium tracking-[0.04em] text-[#D8C8AE]">
                    Live Forensic Projection
                  </div>
                  <h3 className="text-xl font-semibold text-[#F7F3EB]">
                    Built for Managing Brokers Who Want Exact Dollar Proof
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#060A08]/88 backdrop-blur-xl border border-[#D8C8AE]/18 p-4">
                  <div>
                    <div className="text-[11px] text-[#A8A49B]">
                      Quarterly Volume Modeled
                    </div>
                    <div className="mt-1 font-mono text-lg font-semibold text-[#F7F3EB] tabular-nums">
                      {formatCurrencyWhole(estimate.quarterlyGrossGci)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#A8A49B]">
                      Est. Flagged Closings
                    </div>
                    <div className="mt-1 font-mono text-lg font-semibold text-[#58B38E] tabular-nums">
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
              <div className="text-xs font-medium tracking-[0.04em] text-[#D8C8AE]">
                What Lands in Your Inbox Within 48 Hours
              </div>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#F7F3EB]">
                Three Concrete Audit Deliverables. Zero Meetings.
              </h3>
            </div>
            <span className="text-xs text-[#A8A49B]">
              Included free on every 3-deal diagnostic
            </span>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* 1. Executive PDF Summary Visual Mockup */}
            <ScrollReveal delay={0.04}>
              <GlassSpotlightCard className="h-full p-5 sm:p-6 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#0B6B4A]/20 border border-[#D8C8AE]/20 flex items-center justify-center text-[#D8C8AE] shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-[#F7F3EB]">
                        Executive PDF Summary
                      </h4>
                      <div className="text-xs text-[#A8A49B]">
                        Confidential Report (.pdf)
                      </div>
                    </div>
                  </div>

                  {/* Visual PDF Page Mockup */}
                  <div className="rounded-xl bg-[#060A08]/90 border border-[#D8C8AE]/[0.1] p-4 space-y-3">
                    <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[#D8C8AE]/[0.1]">
                      <span className="font-semibold text-[#F7F3EB]">
                        ZED Forensic GCI Brief
                      </span>
                      <span className="font-mono text-[#58B38E] tabular-nums">
                        +$22,335
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#A8A49B]">Split Drift</span>
                          <span className="font-mono text-[#F7F3EB] tabular-nums">
                            48%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/[0.07] overflow-hidden">
                          <div className="h-full w-[48%] rounded-full bg-[#0B6B4A]" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#A8A49B]">
                            Uncollected Referrals
                          </span>
                          <span className="font-mono text-[#F7F3EB] tabular-nums">
                            36%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/[0.07] overflow-hidden">
                          <div className="h-full w-[36%] rounded-full bg-[#D8C8AE]" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#A8A49B]">Waived Fees</span>
                          <span className="font-mono text-[#F7F3EB] tabular-nums">
                            16%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/[0.07] overflow-hidden">
                          <div className="h-full w-[16%] rounded-full bg-[#58B38E]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#B0ACA3] leading-[1.68] tracking-[0.01em]">
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
                    <div className="h-10 w-10 rounded-xl bg-[#0B6B4A]/20 border border-[#D8C8AE]/20 flex items-center justify-center text-[#D8C8AE] shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-[#F7F3EB]">
                        Line-by-Line Discrepancy CSV
                      </h4>
                      <div className="text-xs text-[#A8A49B]">
                        Accounting Ledger (.csv)
                      </div>
                    </div>
                  </div>

                  {/* Visual CSV Spreadsheet Mockup */}
                  <div className="rounded-xl bg-[#060A08]/90 border border-[#D8C8AE]/[0.1] overflow-hidden">
                    <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-[#0B6B4A]/20 border-b border-[#D8C8AE]/[0.1] text-[10px] font-medium text-[#D8C8AE]">
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
                          <span className="col-span-2 text-[#E8E2D6] truncate">
                            {row.deal}
                          </span>
                          <span className="text-right font-mono text-[#A8A49B] tabular-nums">
                            {row.paid}
                          </span>
                          <span className="text-right font-mono font-semibold text-[#D98276] tabular-nums">
                            {row.delta}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#B0ACA3] leading-[1.68] tracking-[0.01em]">
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
                    <div className="h-10 w-10 rounded-xl bg-[#0B6B4A]/20 border border-[#D8C8AE]/20 flex items-center justify-center text-[#D8C8AE] shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-[#F7F3EB]">
                        Private Loom Walkthrough
                      </h4>
                      <div className="text-xs text-[#A8A49B]">
                        Async Video Briefing (5–7 min)
                      </div>
                    </div>
                  </div>

                  {/* Interactive Loom Video Thumbnail with Play Button */}
                  <button
                    type="button"
                    onClick={() => setLoomPreviewOpen(true)}
                    aria-label="Preview sample Private Loom Walkthrough breakdown"
                    className="group/play relative block w-full aspect-[16/10] rounded-xl overflow-hidden border border-[#D8C8AE]/20 text-left cursor-pointer"
                  >
                    <Image
                      src="/images/candid/override-laptop.jpg"
                      alt="Private Loom audit walkthrough video thumbnail"
                      fill
                      sizes="(max-width: 1024px) 100vw, 360px"
                      referrerPolicy="no-referrer"
                      className="object-cover transition-transform duration-500 group-hover/play:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#060A08]/90 via-[#060A08]/35 to-transparent"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="h-13 w-13 rounded-full bg-[#0B6B4A] group-hover/play:bg-[#117C57] text-[#F7F3EB] border border-[#D8C8AE]/30 flex items-center justify-center shadow-[0_10px_28px_rgba(0,0,0,0.5)] transition-transform duration-200 group-hover/play:scale-105">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </span>
                    </div>
                    <div className="absolute inset-x-3 bottom-2.5 flex items-center justify-between text-[11px] text-[#F7F3EB]">
                      <span className="font-medium">
                        3-Deal Forensic Walkthrough
                      </span>
                      <span className="font-mono text-[#D8C8AE] tabular-nums">
                        06:14
                      </span>
                    </div>
                  </button>
                </div>

                <p className="text-xs text-[#B0ACA3] leading-[1.68] tracking-[0.01em]">
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
        <DialogContent className="sm:max-w-lg bg-[#0B110F]/95 backdrop-blur-2xl text-[#F5F2EB] border border-[#D8C8AE]/20 shadow-[0_24px_70px_rgba(0,0,0,0.7)]">
          <DialogHeader className="text-left space-y-2">
            <div className="text-xs font-medium text-[#D8C8AE]">
              Sample Async Loom Briefing · 06:14 · Zero Live Calls
            </div>
            <DialogTitle className="text-xl font-semibold text-[#F7F3EB]">
              Inside Your Private 48-Hour Loom Walkthrough
            </DialogTitle>
            <DialogDescription className="text-sm text-[#B0ACA3]">
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
                className="rounded-xl bg-[#060A08]/85 border border-[#D8C8AE]/15 p-3.5 flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-[#58B38E] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-semibold text-[#D8C8AE] tabular-nums">
                      {chapter.time}
                    </span>
                    <span className="font-semibold text-[#F7F3EB]">
                      {chapter.title}
                    </span>
                  </div>
                  <p className="text-xs text-[#B0ACA3] leading-[1.68]">
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
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#F7F3EB] transition-colors cursor-pointer"
            >
              Close Preview
            </button>
            <button
              type="button"
              onClick={() => {
                setLoomPreviewOpen(false);
                handleRunAudit();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B6B4A] hover:bg-[#117C57] text-[#F7F3EB] border border-[#D8C8AE]/20 text-xs font-semibold transition-colors cursor-pointer"
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
