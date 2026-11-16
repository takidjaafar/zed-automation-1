'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Calculator, SlidersHorizontal } from 'lucide-react';

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
  const [responseTierId, setResponseTierId] = useState<'manual' | 'moderate' | 'instant'>('instant');

  const activeTier = useMemo(
    () => RESPONSE_TIERS.find((tier) => tier.id === responseTierId) ?? RESPONSE_TIERS[2],
    [responseTierId],
  );

  const metrics = useMemo(() => {
    const monthlyGrossGci = monthlyDeals * avgGci;
    const monthlyCommissionLeakage = monthlyGrossGci * errorRate;
    const quarterlyCommissionLeakage = monthlyCommissionLeakage * 3;
    const annualLeakage = monthlyCommissionLeakage * 12;
    const speedToLeadUplift90d = activeTier.upliftDealsPerQuarter * avgGci;
    const projected90dRecovery = quarterlyCommissionLeakage + speedToLeadUplift90d;

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
    <section id="leakage-sandbox" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
            01 · Interactive Leakage Model
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-white">
            Inline Brokerage Leakage Sandbox
          </h2>
        </div>
        <Link
          href="/commission-calculator"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          <Calculator className="w-3.5 h-3.5 text-[#10B981]" />
          Open Full Discrepancy Calculator
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="rounded-xl bg-[#0D1017] border border-white/[0.08] border-t-white/[0.15] grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08] overflow-hidden">
        {/* Left Controls */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="inline-flex items-center gap-2 uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              Brokerage Inputs
            </span>
            <span className="tabular-nums">
              {formatUsd(metrics.monthlyGrossGci)} / mo Gross GCI
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Monthly Closed Sides */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="sandbox-monthly-deals"
                  className="text-xs font-medium text-slate-300"
                >
                  Monthly Closed Sides
                </label>
                <span className="text-sm font-mono font-semibold text-white tabular-nums">
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
                className="w-full accent-[#10B981] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-500 tabular-nums">
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
                  className="text-xs font-medium text-slate-300"
                >
                  Avg. GCI per Side
                </label>
                <span className="text-sm font-mono font-semibold text-white tabular-nums">
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
                className="w-full accent-[#10B981] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-500 tabular-nums">
                <span>$3.5k</span>
                <span>$14k</span>
                <span>$25k</span>
              </div>
            </div>
          </div>

          {/* Unaudited Split & Fee Drift */}
          <div className="space-y-2.5">
            <div className="text-xs font-medium text-slate-300">
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
                        ? 'bg-white/[0.08] border-white/[0.24] text-white font-semibold'
                        : 'bg-[#07090E] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.14]'
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
            <div className="text-xs font-medium text-slate-300">
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
                        ? 'bg-white/[0.08] border-white/[0.24] text-white font-semibold'
                        : 'bg-[#07090E] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.14]'
                    }`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Telemetry Output */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-[#090C12] flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="uppercase tracking-wider">Projected Audit Ledger</span>
              <span>Tabular Estimate</span>
            </div>

            <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
              <div className="py-3.5 flex items-baseline justify-between gap-4">
                <span className="text-xs text-slate-400">Monthly Commission Drift</span>
                <span className="text-base font-mono font-semibold text-rose-400 tabular-nums">
                  -{formatUsd(metrics.monthlyCommissionLeakage)}
                </span>
              </div>

              <div className="py-3.5 flex items-baseline justify-between gap-4">
                <span className="text-xs text-slate-400">Annualized Unaudited Leakage</span>
                <span className="text-lg font-mono font-semibold text-white tabular-nums">
                  {formatUsd(metrics.annualLeakage)}
                </span>
              </div>

              <div className="py-3.5 flex items-baseline justify-between gap-4">
                <span className="text-xs text-slate-400">
                  90d Speed-to-Lead Capture ({activeTier.label})
                </span>
                <span className="text-base font-mono font-semibold text-slate-200 tabular-nums">
                  +{formatUsd(metrics.speedToLeadUplift90d)}
                </span>
              </div>

              <div className="py-4 flex items-baseline justify-between gap-4">
                <span className="text-xs font-medium text-slate-200">
                  Projected 90-Day Net Recovery
                </span>
                <span className="text-2xl font-mono font-bold text-[#10B981] tabular-nums">
                  +{formatUsd(metrics.projected90dRecovery)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
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
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#07090E] font-semibold text-sm h-11 px-4 transition-colors cursor-pointer whitespace-nowrap"
            >
              Verify on 3 Real Closed Deals
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] font-mono text-slate-500 text-center">
              Delivered via PDF + private Loom in 48h · Written delivery only
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
