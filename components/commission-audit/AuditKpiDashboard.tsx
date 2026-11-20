'use client';

import React, { useMemo } from 'react';
import {
  AlertCircle,
  Building2,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { summarizeAudit } from '@/lib/commission-audit/audit';
import { formatMoney } from '@/lib/commission-audit/format';
import type { AuditSummary } from '@/lib/commission-audit/audit';
import type { Transaction } from '@/types/commission-audit';

export interface AuditKpiDashboardProps {
  transactions: Transaction[];
  /** Pre-computed summary; when omitted it is derived from `transactions`. */
  summary?: AuditSummary;
}

/**
 * The five KPI tiles shown above the audit workspace and in the read-only
 * client view. Uses the shared calculation engine so every surface agrees.
 */
export default function AuditKpiDashboard({ transactions, summary }: AuditKpiDashboardProps) {
  const resolved = useMemo(
    () => summary ?? summarizeAudit(transactions),
    [summary, transactions],
  );

  const {
    totalTransactions,
    totalOverpaid,
    totalUnderpaid,
    totalMissingReferral,
    netDiscrepancy,
  } = resolved;

  return (
    <section
      aria-label="Audit summary metrics"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
    >
      {/* Total Audited */}
      <div className="bg-[#0B1210]/90 backdrop-blur-xl rounded-xl p-5 border border-emerald-400/15 hover:border-emerald-400/30 transition-colors relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Audited Deals
          </span>
          <div className="p-2 rounded-lg bg-[#040807]/90 border border-emerald-400/20 text-emerald-300">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
            {totalTransactions}
          </span>
          <span className="text-xs font-mono text-slate-400">sides</span>
        </div>
        <div className="mt-2 text-xs text-slate-400">Total volume logged</div>
      </div>

      {/* Broker Overpaid */}
      <div className="bg-[#0B1210]/90 backdrop-blur-xl rounded-xl p-5 border border-rose-500/20 hover:border-rose-400/35 transition-colors relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-rose-300">
            Broker Overpaid
          </span>
          <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/25 text-rose-400">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-rose-400 font-mono tabular-nums">
            {formatMoney(totalOverpaid)}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400">Excess funds paid to agent</div>
      </div>

      {/* Broker Underpaid */}
      <div className="bg-[#0B1210]/90 backdrop-blur-xl rounded-xl p-5 border border-amber-500/20 hover:border-amber-400/35 transition-colors relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
            Broker Underpaid
          </span>
          <div className="p-2 rounded-lg bg-amber-950/50 border border-amber-500/25 text-amber-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-amber-400 font-mono tabular-nums">
            {formatMoney(totalUnderpaid)}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400">Agent owed unpaid balance</div>
      </div>

      {/* Missing Referral Income */}
      <div className="bg-[#0B1210]/90 backdrop-blur-xl rounded-xl p-5 border border-emerald-400/15 hover:border-emerald-400/30 transition-colors relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-teal-300">
            Missing Referral $
          </span>
          <div className="p-2 rounded-lg bg-teal-950/50 border border-teal-400/25 text-teal-300">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-teal-300 font-mono tabular-nums">
            {formatMoney(totalMissingReferral)}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400">Uncollected incoming fees</div>
      </div>

      {/* Net Discrepancy */}
      <div className="bg-[#0B1210]/95 backdrop-blur-xl rounded-xl p-5 border border-emerald-400/30 relative overflow-hidden shadow-[0_0_28px_rgba(16,185,129,0.08)]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300">
            Net Discrepancy
          </span>
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-400/30 text-[#10B981]">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3.5 flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold tracking-tight font-mono tabular-nums ${
              netDiscrepancy > 0.5
                ? 'text-rose-400'
                : netDiscrepancy < -0.5
                  ? 'text-amber-400'
                  : 'text-[#10B981]'
            }`}
          >
            {(netDiscrepancy > 0 ? '+' : '') + formatMoney(netDiscrepancy)}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-300">
          {netDiscrepancy > 0.5
            ? 'Net Broker Leakage'
            : netDiscrepancy < -0.5
              ? 'Net Agent Shortfall'
              : 'Balanced / Clean Books'}
        </div>
      </div>
    </section>
  );
}
