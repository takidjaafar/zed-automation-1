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
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Audited */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Audited Deals</span>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{totalTransactions}</span>
          <span className="text-xs text-slate-500">deals</span>
        </div>
        <div className="mt-2 text-xs text-slate-400">Total volume logged</div>
      </div>

      {/* Broker Overpaid */}
      <div className="bg-white rounded-xl p-5 border border-rose-200 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-rose-50/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Broker Overpaid</span>
          <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-rose-600">{formatMoney(totalOverpaid)}</span>
        </div>
        <div className="mt-2 text-xs text-rose-600/80 font-medium">Excess funds paid to agent</div>
      </div>

      {/* Broker Underpaid */}
      <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-amber-50/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Broker Underpaid</span>
          <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-amber-600">{formatMoney(totalUnderpaid)}</span>
        </div>
        <div className="mt-2 text-xs text-amber-700/80 font-medium">Agent owed unpaid balance</div>
      </div>

      {/* Missing Referral Income */}
      <div className="bg-white rounded-xl p-5 border border-indigo-200 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Missing Referral $</span>
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-indigo-600">{formatMoney(totalMissingReferral)}</span>
        </div>
        <div className="mt-2 text-xs text-indigo-700/80 font-medium">Uncollected incoming fees</div>
      </div>

      {/* Net Discrepancy */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Discrepancy</span>
          <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold tracking-tight ${
              netDiscrepancy > 0.5
                ? 'text-rose-600'
                : netDiscrepancy < -0.5
                  ? 'text-amber-600'
                  : 'text-emerald-600'
            }`}
          >
            {(netDiscrepancy > 0 ? '+' : '') + formatMoney(netDiscrepancy)}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
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
