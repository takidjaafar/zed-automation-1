'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronRight,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react';
import {
  AnimatedNumber,
  GlassSpotlightCard,
} from '@/components/landing/MotionPrimitives';

export interface LedgerDeal {
  id: string;
  address: string;
  agent: string;
  closeDate: string;
  salePrice: number;
  grossGci: number;
  expectedSplitPct: number;
  paidAmount: number;
  expectedPayout: number;
  variance: number;
  category: string;
  scope: 'split' | 'full';
  rule: string;
  status: 'flagged' | 'verified';
}

const LEDGER_DEALS: LedgerDeal[] = [
  {
    id: 'TX-8412',
    address: '412 Oak Ridge Dr',
    agent: 'M. Vance',
    closeDate: '2026-10-28',
    salePrice: 485000,
    grossGci: 14550,
    expectedSplitPct: 70,
    paidAmount: 11640,
    expectedPayout: 10185,
    variance: 1455,
    category: 'Split Tier Drift',
    scope: 'split',
    rule: '80/20 post-cap rate applied prior to $18,000 anniversary cap clearance',
    status: 'flagged',
  },
  {
    id: 'TX-8419',
    address: '1904 Pinehurst Ave',
    agent: 'S. Chen',
    closeDate: '2026-11-02',
    salePrice: 620000,
    grossGci: 15500,
    expectedSplitPct: 75,
    paidAmount: 15500,
    expectedPayout: 11625,
    variance: 3875,
    category: 'Referral Uncollected',
    scope: 'full',
    rule: '25% outbound relocation referral omitted from closing settlement sheet',
    status: 'flagged',
  },
  {
    id: 'TX-8424',
    address: '88 Maplewood Ln',
    agent: 'D. Brooks',
    closeDate: '2026-11-06',
    salePrice: 390000,
    grossGci: 11700,
    expectedSplitPct: 80,
    paidAmount: 9855,
    expectedPayout: 9360,
    variance: 495,
    category: 'Fee Shortfall',
    scope: 'full',
    rule: '$495 brokerage compliance & admin fee waived without managing broker sign-off',
    status: 'flagged',
  },
  {
    id: 'TX-8431',
    address: '730 Cedar Crest Way',
    agent: 'K. Patel',
    closeDate: '2026-11-09',
    salePrice: 630000,
    grossGci: 18900,
    expectedSplitPct: 80,
    paidAmount: 15120,
    expectedPayout: 15120,
    variance: 0,
    category: 'Cap Matched',
    scope: 'split',
    rule: 'Split, $495 transaction fee, and E&O deduction reconciled to CD',
    status: 'verified',
  },
  {
    id: 'TX-8438',
    address: '215 Harbor View Ct',
    agent: 'R. Alvarez',
    closeDate: '2026-11-12',
    salePrice: 540000,
    grossGci: 16200,
    expectedSplitPct: 70,
    paidAmount: 12960,
    expectedPayout: 11340,
    variance: 1620,
    category: 'Split Tier Drift',
    scope: 'split',
    rule: '10% override discrepancy between MLS commission instruction and ACH payout',
    status: 'flagged',
  },
];

function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function HeroAuditTerminal({
  onScrollToSandbox,
  onOpenModal,
}: {
  onScrollToSandbox?: () => void;
  onOpenModal?: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string>(LEDGER_DEALS[0].id);
  const [auditScope, setAuditScope] = useState<'splits' | 'full'>('full');

  const selectedDeal = useMemo(
    () => LEDGER_DEALS.find((deal) => deal.id === selectedId) ?? LEDGER_DEALS[0],
    [selectedId],
  );

  const splitDriftLeakage = useMemo(
    () =>
      LEDGER_DEALS.filter((deal) => deal.scope === 'split').reduce(
        (sum, deal) => sum + deal.variance,
        0,
      ),
    [],
  );

  const referralAndFeeRecovery = useMemo(
    () =>
      auditScope === 'full'
        ? LEDGER_DEALS.filter((deal) => deal.scope === 'full').reduce(
            (sum, deal) => sum + deal.variance,
            0,
          )
        : 0,
    [auditScope],
  );

  const sampleFlaggedTotal = splitDriftLeakage + referralAndFeeRecovery;
  const projected90DayRecovery = sampleFlaggedTotal * 3;
  const flaggedCount =
    auditScope === 'full'
      ? LEDGER_DEALS.filter((deal) => deal.variance > 0).length
      : LEDGER_DEALS.filter((deal) => deal.scope === 'split' && deal.variance > 0)
          .length;

  return (
    <GlassSpotlightCard borderBeam={true} shimmer={true} tilt={false}>
      {/* Terminal Top Header */}
      <div className="px-3.5 sm:px-5 py-3.5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-1.5 w-1.5 rounded-sm bg-emerald-400/80 shrink-0"
            aria-hidden="true"
          />
          <span className="text-xs font-semibold tracking-tight text-slate-100 truncate">
            Brokerage GCI Ledger
          </span>
          <span className="text-white/20 text-xs shrink-0" aria-hidden="true">
            /
          </span>
          <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
            <span className="font-mono tabular-nums">5</span> Closed Sides
          </span>
        </div>

        {/* Reconciliation Scope Toggle */}
        <div
          role="group"
          aria-label="Reconciliation scope toggle"
          className="inline-flex max-w-full items-center rounded-lg bg-[#040807]/85 border border-white/[0.08] p-0.5"
        >
          <button
            type="button"
            onClick={() => setAuditScope('splits')}
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-medium transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap ${
              auditScope === 'splits'
                ? 'bg-white/[0.1] text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3 shrink-0" />
            Splits Only
          </button>
          <button
            type="button"
            onClick={() => setAuditScope('full')}
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-[11px] transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap ${
              auditScope === 'full'
                ? 'bg-[#10B981] text-[#040807] font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <FileCheck2 className="w-3 h-3 shrink-0" />
            Full CD + Referrals
          </button>
        </div>
      </div>

      {/* Ledger Column Headers */}
      <div className="px-3.5 sm:px-5 py-2.5 border-b border-white/[0.06] grid grid-cols-12 gap-2 text-[11px] font-medium text-slate-400">
        <div className="col-span-5 min-w-0 truncate">Closed Side / Agent</div>
        <div className="col-span-3 min-w-0 text-right whitespace-nowrap">Gross GCI</div>
        <div className="col-span-4 min-w-0 text-right whitespace-nowrap">Variance</div>
      </div>

      {/* Clickable Ledger Rows */}
      <div
        className="divide-y divide-white/[0.06]"
        role="listbox"
        aria-label="Audited closed transactions"
      >
        {LEDGER_DEALS.map((deal) => {
          const isSelected = deal.id === selectedDeal.id;
          const activeVariance =
            auditScope === 'splits' && deal.scope === 'full' ? 0 : deal.variance;

          return (
            <button
              key={deal.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => setSelectedId(deal.id)}
              className={`w-full text-left px-3.5 sm:px-5 py-3 grid grid-cols-12 gap-1.5 sm:gap-2 items-center transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-emerald-400/[0.07]'
                  : 'hover:bg-white/[0.03]'
              }`}
            >
              <div className="col-span-5 min-w-0 flex items-center gap-1.5 sm:gap-2">
                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isSelected ? 'text-emerald-400 rotate-90' : 'text-slate-600'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-xs sm:text-[13px] font-medium text-white truncate">
                    {deal.address}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    <span className="font-mono tabular-nums">{deal.id}</span> · {deal.agent}
                  </div>
                </div>
              </div>

              <div className="col-span-3 min-w-0 text-right font-mono text-[11px] sm:text-[13px] text-slate-200 tabular-nums whitespace-nowrap">
                {formatUsd(deal.grossGci)}
              </div>

              <div className="col-span-4 min-w-0 text-right">
                {activeVariance > 0 ? (
                  <span className="font-mono text-[11px] sm:text-[13px] tabular-nums text-rose-400 font-medium whitespace-nowrap">
                    -{formatUsd(activeVariance)}
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-end gap-1 font-mono text-[11px] sm:text-[13px] tabular-nums text-emerald-400 whitespace-nowrap">
                    <Check className="w-3 h-3 shrink-0" />
                    {deal.variance > 0 ? 'Skipped' : '$0'}
                  </span>
                )}
                <div className="text-[11px] text-slate-400 truncate">
                  {deal.category}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Row Forensic Line Inspector */}
      <div className="px-3.5 sm:px-5 py-4 border-t border-white/[0.08] bg-[#060C0A]/80 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="font-medium text-emerald-300/90">
            Line Inspection ·{' '}
            <span className="font-mono tabular-nums">{selectedDeal.id}</span> ·{' '}
            <span className="font-mono tabular-nums">{selectedDeal.closeDate}</span>
          </div>
          <div className="text-slate-400">
            Sale{' '}
            <span className="font-mono tabular-nums text-slate-200">
              {formatUsd(selectedDeal.salePrice)}
            </span>{' '}
            · Split{' '}
            <span className="font-mono tabular-nums text-slate-200">
              {selectedDeal.expectedSplitPct}%
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed">
          {selectedDeal.rule}
        </p>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2.5 border-t border-white/[0.06] text-xs">
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-slate-400 truncate">
              Expected Payout
            </div>
            <div className="mt-0.5 font-mono tabular-nums text-slate-100 font-medium">
              {formatUsd(selectedDeal.expectedPayout)}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-slate-400 truncate">
              Disbursed
            </div>
            <div className="mt-0.5 font-mono tabular-nums text-slate-100 font-medium">
              {formatUsd(selectedDeal.paidAmount)}
            </div>
          </div>
          <div className="min-w-0 text-right">
            <div className="text-[11px] font-medium text-slate-400 truncate">
              Recoverable
            </div>
            <div
              className={`mt-0.5 font-mono tabular-nums font-semibold ${
                selectedDeal.variance > 0 ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {selectedDeal.variance > 0
                ? `+${formatUsd(selectedDeal.variance)}`
                : '$0'}
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Commission Reconciliation Summary */}
      <div className="px-3.5 sm:px-5 py-4 border-t border-white/[0.08] bg-[#08100E]/85 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div>
          <div className="text-xs font-medium text-slate-400">
            Split Drift (<span className="font-mono tabular-nums">{flaggedCount}</span> files)
          </div>
          <div className="mt-1 text-base font-mono font-semibold text-white">
            <AnimatedNumber value={splitDriftLeakage} prefix="$" />
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-slate-400">
            CD &amp; Referral Clawback
          </div>
          <div className="mt-1 text-base font-mono font-semibold text-slate-100">
            <AnimatedNumber value={referralAndFeeRecovery} prefix="+$" />
          </div>
        </div>

        <div className="sm:text-right">
          <div className="text-xs font-medium text-slate-400">
            Projected 90d Net Recovery
          </div>
          <div className="mt-1 text-xl font-mono font-bold text-emerald-400">
            <AnimatedNumber value={projected90DayRecovery} prefix="+$" />
          </div>
        </div>
      </div>

      {/* Public Conversion Action Bar (Zero Password Wall) */}
      <div className="px-3.5 sm:px-5 py-3 border-t border-white/[0.08] bg-[#040807]/85 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 text-xs font-medium">
        <button
          type="button"
          onClick={onScrollToSandbox}
          className="inline-flex items-center gap-1.5 py-0.5 text-slate-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
        >
          <ArrowDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          Model Your Brokerage Leakage
        </button>
        <button
          type="button"
          onClick={onOpenModal}
          className="inline-flex items-center gap-1.5 py-0.5 text-emerald-300 hover:text-emerald-200 font-semibold transition-colors whitespace-nowrap cursor-pointer"
        >
          Submit 3 Deals for Free Audit
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </div>
    </GlassSpotlightCard>
  );
}
