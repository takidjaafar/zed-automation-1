'use client';

import React, { useMemo, useState } from 'react';
import { Check, ChevronRight, Clock, Zap } from 'lucide-react';

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

export default function HeroAuditTerminal() {
  const [selectedId, setSelectedId] = useState<string>(LEDGER_DEALS[0].id);
  const [speedMode, setSpeedMode] = useState<'manual' | 'automated'>('automated');

  const selectedDeal = useMemo(
    () => LEDGER_DEALS.find((deal) => deal.id === selectedId) ?? LEDGER_DEALS[0],
    [selectedId],
  );

  const flaggedLeakage = useMemo(
    () => LEDGER_DEALS.reduce((sum, deal) => sum + deal.variance, 0),
    [],
  );

  const speedToLeadUplift = speedMode === 'automated' ? 26400 : 0;
  const recoveredLeadsCount = speedMode === 'automated' ? '3.1' : '0.0';
  const projected90DayRecovery = flaggedLeakage + speedToLeadUplift;

  return (
    <div className="rounded-xl bg-[#0D1017] border border-white/[0.08] border-t-white/[0.15] overflow-hidden">
      {/* Terminal Top Header */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="h-2 w-2 rounded-sm bg-[#10B981] shrink-0" aria-hidden="true" />
          <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-200 truncate">
            Brokerage GCI Ledger
          </span>
          <span className="text-slate-600 text-xs" aria-hidden="true">
            /
          </span>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            UTC 14:30
          </span>
        </div>

        {/* Speed-to-Lead Response Toggle */}
        <div
          role="group"
          aria-label="Speed-to-Lead response time toggle"
          className="inline-flex items-center rounded-lg bg-[#07090E] border border-white/[0.08] p-0.5"
        >
          <button
            type="button"
            onClick={() => setSpeedMode('manual')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap ${
              speedMode === 'manual'
                ? 'bg-white/[0.09] text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            &gt;4h Manual
          </button>
          <button
            type="button"
            onClick={() => setSpeedMode('automated')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap ${
              speedMode === 'automated'
                ? 'bg-[#10B981] text-[#07090E] font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3" />
            &lt;90s Automated
          </button>
        </div>
      </div>

      {/* Ledger Column Headers */}
      <div className="px-4 sm:px-5 py-2.5 border-b border-white/[0.08] grid grid-cols-12 gap-2 text-[11px] font-mono uppercase tracking-wider text-slate-500">
        <div className="col-span-5 sm:col-span-5">Closed Side / Agent</div>
        <div className="col-span-3 text-right">Gross GCI</div>
        <div className="col-span-4 text-right">Variance</div>
      </div>

      {/* Clickable Ledger Rows */}
      <div className="divide-y divide-white/[0.06]" role="listbox" aria-label="Audited closed transactions">
        {LEDGER_DEALS.map((deal) => {
          const isSelected = deal.id === selectedDeal.id;
          return (
            <button
              key={deal.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => setSelectedId(deal.id)}
              className={`w-full text-left px-4 sm:px-5 py-3 grid grid-cols-12 gap-2 items-center transition-colors cursor-pointer ${
                isSelected ? 'bg-white/[0.045]' : 'hover:bg-white/[0.025]'
              }`}
            >
              <div className="col-span-5 min-w-0 flex items-center gap-2">
                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isSelected ? 'text-[#10B981] rotate-90' : 'text-slate-600'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-xs sm:text-[13px] font-medium text-slate-100 truncate">
                    {deal.address}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate tabular-nums">
                    {deal.id} · {deal.agent}
                  </div>
                </div>
              </div>

              <div className="col-span-3 text-right font-mono text-xs sm:text-[13px] text-slate-300 tabular-nums">
                {formatUsd(deal.grossGci)}
              </div>

              <div className="col-span-4 text-right font-mono text-xs sm:text-[13px] tabular-nums">
                {deal.variance > 0 ? (
                  <span className="text-rose-400 font-medium">
                    -{formatUsd(deal.variance)}
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-end gap-1 text-[#10B981]">
                    <Check className="w-3 h-3" />
                    $0
                  </span>
                )}
                <div className="text-[10px] text-slate-500 truncate">
                  {deal.category}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Row Forensic Line Inspector */}
      <div className="px-4 sm:px-5 py-4 border-t border-white/[0.08] bg-[#090C12] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Line Inspection · {selectedDeal.id} · {selectedDeal.closeDate}
          </div>
          <div className="text-[11px] font-mono text-slate-400 tabular-nums">
            Sale {formatUsd(selectedDeal.salePrice)} · Split {selectedDeal.expectedSplitPct}%
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {selectedDeal.rule}
        </p>

        <div className="grid grid-cols-3 gap-3 pt-1 border-t border-white/[0.06] font-mono text-xs tabular-nums">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              Expected Payout
            </div>
            <div className="mt-0.5 text-slate-200 font-medium">
              {formatUsd(selectedDeal.expectedPayout)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              Disbursed
            </div>
            <div className="mt-0.5 text-slate-200 font-medium">
              {formatUsd(selectedDeal.paidAmount)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              Recoverable
            </div>
            <div
              className={`mt-0.5 font-semibold ${
                selectedDeal.variance > 0 ? 'text-[#10B981]' : 'text-slate-400'
              }`}
            >
              {selectedDeal.variance > 0 ? `+${formatUsd(selectedDeal.variance)}` : '$0'}
            </div>
          </div>
        </div>
      </div>

      {/* Speed-to-Lead + Projected 90-Day Net Recovery Summary */}
      <div className="px-4 sm:px-5 py-4 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Flagged Leakage
          </div>
          <div className="mt-1 text-base font-mono font-semibold text-slate-100 tabular-nums">
            {formatUsd(flaggedLeakage)}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            90d Speed-to-Lead ({recoveredLeadsCount} deals)
          </div>
          <div className="mt-1 text-base font-mono font-semibold text-slate-200 tabular-nums">
            +{formatUsd(speedToLeadUplift)}
          </div>
        </div>

        <div className="sm:text-right">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Projected 90d Net Recovery
          </div>
          <div className="mt-1 text-xl font-mono font-bold text-[#10B981] tabular-nums">
            +{formatUsd(projected90DayRecovery)}
          </div>
        </div>
      </div>
    </div>
  );
}
