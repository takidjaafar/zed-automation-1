'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, Trash2 } from 'lucide-react';

import { calculateAudit, summarizeAudit } from '@/lib/commission-audit/audit';
import { formatMoney, formatPercent } from '@/lib/commission-audit/format';
import type { AuditFilter, Transaction } from '@/types/commission-audit';

export interface TransactionTableProps {
  transactions: Transaction[];
  /**
   * Read-only mode (client share link): hides the Actions column entirely —
   * no inspect, no delete.
   */
  readOnly?: boolean;
  onDelete?: (id: string) => void;
  onInspect?: (transaction: Transaction) => void;
  title?: string;
  subtitle?: string;
}

const FILTERS: Array<{ key: AuditFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'discrepancy', label: 'Errors Only' },
  { key: 'overpaid', label: 'Overpaid' },
  { key: 'underpaid', label: 'Underpaid' },
  { key: 'referral', label: 'Missing Referral' },
];

/**
 * The audited commission log. Shared by the working audit page and the
 * read-only client view so both always render identical figures.
 */
export default function TransactionTable({
  transactions,
  readOnly = false,
  onDelete,
  onInspect,
  title = 'Audited Commission Log',
  subtitle = 'Variance flags: Rose for Overpayment, Amber for Underpayment',
}: TransactionTableProps) {
  const [filter, setFilter] = useState<AuditFilter>('all');

  const summary = useMemo(() => summarizeAudit(transactions), [transactions]);

  const counts: Record<AuditFilter, number> = {
    all: transactions.length,
    discrepancy: summary.discrepancyCount,
    overpaid: summary.overpaidCount,
    underpaid: summary.underpaidCount,
    referral: summary.referralCount,
  };

  const visible = transactions.filter((transaction) => {
    if (filter === 'all') return true;
    const audit = calculateAudit(transaction);
    if (filter === 'discrepancy') return audit.status !== 'correct';
    if (filter === 'overpaid') return audit.status === 'overpaid';
    if (filter === 'underpaid') return audit.status === 'underpaid';
    if (filter === 'referral') return audit.hasMissingReferral;
    return true;
  });

  return (
    <section className="bg-[#0B1120] rounded-2xl border border-slate-800/80 overflow-hidden">
      <div className="p-6 pb-4 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">{title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#05080F] border border-slate-800">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-xs rounded-md transition whitespace-nowrap shrink-0 cursor-pointer ${
                filter === key
                  ? 'bg-[#10B981] text-[#05080F] font-semibold'
                  : 'text-slate-400 hover:text-white font-medium'
              }`}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800/80 text-left text-xs">
          <thead className="bg-[#05080F] text-slate-400 font-semibold text-[11px]">
            <tr>
              <th scope="col" className="py-3 px-4">Property Address</th>
              <th scope="col" className="py-3 px-4 text-right">Sale Price</th>
              <th scope="col" className="py-3 px-4">Comm %</th>
              <th scope="col" className="py-3 px-4">Splits (L / B / Cut)</th>
              <th scope="col" className="py-3 px-4">Referrals &amp; Fee</th>
              <th scope="col" className="py-3 px-4 text-right">Expected Pay</th>
              <th scope="col" className="py-3 px-4 text-right">Actual Paid</th>
              <th scope="col" className="py-3 px-4 text-right">Discrepancy</th>
              <th scope="col" className="py-3 px-4">Audit Status</th>
              {!readOnly && (
                <th scope="col" className="py-3 px-4 text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-[#0B1120]">
            {visible.map((transaction) => {
              const audit = calculateAudit(transaction);
              return (
                <tr key={transaction.id} className="hover:bg-slate-900/60 transition-colors">
                  <td
                    className="py-3.5 px-4 font-medium text-white max-w-xs truncate"
                    title={transaction.address}
                  >
                    <div className="truncate font-semibold text-slate-100">{transaction.address}</div>
                    <div className="text-[10px] text-slate-500 font-mono">ID: {transaction.id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-200 font-mono tabular-nums">
                    {formatMoney(transaction.salePrice)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono tabular-nums">
                    {formatPercent(transaction.commRate)}
                    <div className="text-[10px] text-slate-500">
                      {formatMoney(audit.totalCommission)} total
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono tabular-nums">
                    <span className="text-slate-200 font-medium">
                      {formatPercent(transaction.listingSplit)}
                    </span>{' '}
                    L / {formatPercent(transaction.buyerSplit)} B
                    <div className="text-[10px] text-slate-500">
                      Brok Cut: {formatPercent(transaction.brokerSplit)} (
                      {formatMoney(audit.brokerageCut)})
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono tabular-nums">
                    <div>
                      Ref Out: {formatPercent(transaction.referralOut)} (
                      {formatMoney(audit.referralFeeOutAmount)})
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Trans Fee: {formatMoney(transaction.transactionFee)}
                    </div>
                    {audit.hasMissingReferral && (
                      <div className="mt-1 text-[10px] font-semibold text-indigo-400">
                        Missing In: {formatMoney(transaction.referralIn)}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-200 font-mono tabular-nums">
                    {formatMoney(audit.expectedAgentPayment)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-200 font-mono tabular-nums">
                    {formatMoney(transaction.actualPaid)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                    <span
                      className={`font-bold ${
                        audit.status === 'overpaid'
                          ? 'text-rose-400'
                          : audit.status === 'underpaid'
                            ? 'text-amber-400'
                            : 'text-[#10B981]'
                      }`}
                    >
                      {(audit.discrepancy > 0 ? '+' : '') + formatMoney(audit.discrepancy)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {audit.status === 'overpaid' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-500/30 font-mono tabular-nums">
                        OVERPAID (+{formatMoney(audit.discrepancy)})
                      </span>
                    )}
                    {audit.status === 'underpaid' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30 font-mono tabular-nums">
                        UNDERPAID ({formatMoney(audit.discrepancy)})
                      </span>
                    )}
                    {audit.status === 'correct' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950/60 text-[#10B981] border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Accurate
                      </span>
                    )}
                  </td>
                  {!readOnly && (
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onInspect?.(transaction)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                        title="Inspect Formula Calculation"
                        aria-label={`Inspect calculation for ${transaction.address}`}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(transaction.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 rounded transition cursor-pointer"
                        title="Delete record"
                        aria-label={`Delete ${transaction.address}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {visible.length === 0 && (
        <div className="p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">
            {transactions.length === 0 ? 'No Transactions Recorded' : 'No Transactions Match Filter'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {transactions.length === 0
              ? readOnly
                ? 'This audit does not contain any transactions yet.'
                : 'Add a transaction, import a CSV, or load the sample records.'
              : 'Adjust your filter options to see more records.'}
          </p>
        </div>
      )}

      <div className="px-6 py-3 border-t border-slate-800/80 text-xs text-slate-500 flex items-center justify-between">
        <span>
          Showing {visible.length} of {transactions.length} transactions
        </span>
        <span>Zed Automation Audit Engine</span>
      </div>
    </section>
  );
}
