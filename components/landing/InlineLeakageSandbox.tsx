'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calculator, Lock, SlidersHorizontal, Zap } from 'lucide-react';
import {
  AnimatedNumber,
  GlassSpotlightCard,
  MagneticButton,
  ScrollReveal,
} from '@/components/landing/MotionPrimitives';

const ERROR_RATES = [
  { label: '1.5% Low Drift', value: 0.015 },
  { label: '2.5% Standard', value: 0.025 },
  { label: '4.0% Elevated', value: 0.04 },
  { label: '5.5% Unaudited', value: 0.055 },
] as const;

const RESPONSE_TIERS = [
  { id: 'manual', label: '>4h Manual', upliftDealsPerQuarter: 0 },
  { id: 'moderate', label: '15–60 Min', upliftDealsPerQuarter: 1.4 },
  { id: 'instant', label: '<90s Auto', upliftDealsPerQuarter: 3.2 },
] as const;

function formatUsd(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
}

export interface SandboxAuditPreset {
  monthlyDeals: number;
  avgGci: number;
  annualLeakage: number;
  projected90dRecovery: number;
  responseTierLabel: string;
}

export default function InlineLeakageSandbox({
  onRequestAuditWithContext,
}: {
  onRequestAuditWithContext: (preset: SandboxAuditPreset) => void;
}) {
  const [monthlyDeals, setMonthlyDeals] = useState<number>(22);
  const [avgGci, setAvgGci] = useState<number>(8800);
  const [errorRate, setErrorRate] = useState<number>(0.025);
  const [responseTierId, setResponseTierId] = useState<
    'manual' | 'moderate' | 'instant'
  >('instant');

  const activeTier = useMemo(
    () =>
      RESPONSE_TIERS.find((tier) => tier.id === responseTierId) ??
      RESPONSE_TIERS[2],
    [responseTierId],
  );

  const metrics = useMemo(() => {
    const monthlyGrossGci = monthlyDeals * avgGci;
    const monthlyCommissionLeakage = monthlyGrossGci * errorRate;
    const quarterlyCommissionLeakage = monthlyCommissionLeakage * 3;
    const annualLeakage = monthlyCommissionLeakage * 12;
    const speedToLeadUplift90d = activeTier.upliftDealsPerQuarter * avgGci;
    const projected90dRecovery =
      quarterlyCommissionLeakage + speedToLeadUplift90d;

    return {
      monthlyGrossGci,
      monthlyCommissionLeakage,
      quarterlyCommissionLeakage,
      annualLeakage,
      speedToLeadUplift90d,
      projected90dRecovery,
    };
  }, [activeTier.upliftDealsPerQuarter, avgGci, errorRate, monthlyDeals]);

  return (
    <section id="leakage-sandbox" className="relative rounded-3xl overflow-hidden border border-emerald-400/20 p-5 sm:p-8 lg:p-10">
      {/* Subtle Dark-Blurred Modern Brokerage Office Backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/images/office-backdrop.jpg"
          alt="Modern brokerage glass boardroom backdrop"
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          referrerPolicy="no-referrer"
          className="object-cover opacity-25 blur-[3px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040807]/90 via-[#040807]/75 to-[#040807]/95" />
      </div>

      <ScrollReveal className="relative z-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-[0.16em] text-slate-400">
              Section 02 · Interactive Leakage Model
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.03em] text-white">
              Inline Brokerage{' '}
              <span className="text-emerald-400">Leakage Sandbox</span>
            </h2>
          </div>
          <Link
            href="/commission-calculator"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-200 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            Launch Full Calculator
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Dual Glowing Smoked Glass Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Card: Interactive Sliders & Controls */}
          <GlassSpotlightCard className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-emerald-400/15">
                <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                  Brokerage Inputs
                </span>
                <span className="text-xs font-mono text-emerald-300/90 tabular-nums">
                  {formatUsd(metrics.monthlyGrossGci)} / mo Gross GCI
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Monthly Closed Sides */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="sandbox-monthly-deals"
                      className="text-xs font-medium text-slate-200"
                    >
                      Monthly Closed Sides
                    </label>
                    <span className="text-sm font-mono font-semibold text-emerald-400 tabular-nums">
                      {monthlyDeals} sides
                    </span>
                  </div>
                  <input
                    id="sandbox-monthly-deals"
                    type="range"
                    min={5}
                    max={100}
                    step={1}
                    value={monthlyDeals}
                    onChange={(e) => setMonthlyDeals(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 tabular-nums">
                    <span>5</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Average GCI per Side */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="sandbox-avg-gci"
                      className="text-xs font-medium text-slate-200"
                    >
                      Avg. GCI per Side
                    </label>
                    <span className="text-sm font-mono font-semibold text-emerald-400 tabular-nums">
                      {formatUsd(avgGci)}
                    </span>
                  </div>
                  <input
                    id="sandbox-avg-gci"
                    type="range"
                    min={3500}
                    max={25000}
                    step={250}
                    value={avgGci}
                    onChange={(e) => setAvgGci(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 tabular-nums">
                    <span>$3.5k</span>
                    <span>$14k</span>
                    <span>$25k</span>
                  </div>
                </div>
              </div>

              {/* Unaudited Split & Fee Drift */}
              <div className="space-y-2.5">
                <div className="text-xs font-medium text-slate-200">
                  Estimated Split, Referral &amp; Fee Drift Rate
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ERROR_RATES.map((rate) => {
                    const active = errorRate === rate.value;
                    return (
                      <button
                        key={rate.value}
                        type="button"
                        onClick={() => setErrorRate(rate.value)}
                        className={`px-3 py-2 rounded-lg text-xs font-mono border transition-colors cursor-pointer text-left tabular-nums ${
                          active
                            ? 'bg-emerald-400/15 border-emerald-400/50 text-white font-semibold'
                            : 'bg-[#040807]/75 border-white/10 text-slate-300 hover:text-white hover:border-emerald-400/30'
                        }`}
                      >
                        {rate.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Speed-to-Lead Tier */}
              <div className="space-y-2.5">
                <div className="text-xs font-medium text-slate-200">
                  Inbound Lead Response Protocol (90-Day Uplift Model)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {RESPONSE_TIERS.map((tier) => {
                    const active = responseTierId === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setResponseTierId(tier.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-mono border transition-colors cursor-pointer text-center tabular-nums ${
                          active
                            ? 'bg-emerald-400/15 border-emerald-400/50 text-white font-semibold'
                            : 'bg-[#040807]/75 border-white/10 text-slate-300 hover:text-white hover:border-emerald-400/30'
                        }`}
                      >
                        {tier.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-400/15 text-[11px] font-mono text-slate-400">
              Adjust deal volume &amp; average commission to calibrate your 90-day audit projection.
            </div>
          </GlassSpotlightCard>

          {/* Right Card: Glowing Loss & Recovery Readout */}
          <GlassSpotlightCard
            borderBeam={true}
            className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-6"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="inline-flex items-center gap-1.5 uppercase tracking-wider text-emerald-300">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  Projected Audit Ledger
                </span>
                <span className="text-slate-400">Tabular Estimate</span>
              </div>

              <div className="divide-y divide-emerald-400/15 border-y border-emerald-400/15">
                <div className="py-3.5 flex items-baseline justify-between gap-4">
                  <span className="text-xs text-slate-300">
                    Monthly Commission Drift
                  </span>
                  <span className="text-lg font-mono font-semibold text-rose-400">
                    <AnimatedNumber
                      value={metrics.monthlyCommissionLeakage}
                      prefix="-$"
                    />
                  </span>
                </div>

                <div className="py-3.5 flex items-baseline justify-between gap-4">
                  <span className="text-xs text-slate-300">
                    Annualized Unaudited Leakage
                  </span>
                  <span className="text-xl font-mono font-bold text-white">
                    <AnimatedNumber value={metrics.annualLeakage} prefix="$" />
                  </span>
                </div>

                <div className="py-3.5 flex items-baseline justify-between gap-4">
                  <span className="text-xs text-slate-300">
                    90d Speed-to-Lead ({activeTier.label})
                  </span>
                  <span className="text-lg font-mono font-semibold text-slate-100">
                    <AnimatedNumber
                      value={metrics.speedToLeadUplift90d}
                      prefix="+$"
                    />
                  </span>
                </div>

                <div className="py-4 flex items-baseline justify-between gap-4">
                  <span className="text-xs font-semibold text-white">
                    Projected 90-Day Net Recovery
                  </span>
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
                    <AnimatedNumber
                      value={metrics.projected90dRecovery}
                      prefix="+$"
                    />
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <MagneticButton className="w-full">
                <button
                  type="button"
                  onClick={() =>
                    onRequestAuditWithContext({
                      monthlyDeals,
                      avgGci,
                      annualLeakage: metrics.annualLeakage,
                      projected90dRecovery: metrics.projected90dRecovery,
                      responseTierLabel: activeTier.label,
                    })
                  }
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#040807] font-semibold text-sm h-11 px-4 shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Verify on 3 Real Closed Deals
                  <ArrowRight className="w-4 h-4" />
                </button>
              </MagneticButton>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/commission-calculator"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#040807]/85 border border-emerald-400/20 hover:border-emerald-400/50 text-xs font-mono text-slate-200 hover:text-emerald-300 h-9 px-3 transition-colors whitespace-nowrap"
                >
                  <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                  Launch Full Calculator
                </Link>
                <Link
                  href="/commission-audit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#040807]/85 border border-emerald-400/20 hover:border-emerald-400/50 text-xs font-mono text-slate-200 hover:text-emerald-300 h-9 px-3 transition-colors whitespace-nowrap"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Open Audit Workspace
                </Link>
              </div>
              <p className="text-[11px] font-mono text-slate-400 text-center">
                Delivered via PDF + private Loom in 48h · Written delivery only
              </p>
            </div>
          </GlassSpotlightCard>
        </div>
      </ScrollReveal>
    </section>
  );
}
