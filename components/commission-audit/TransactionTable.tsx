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
  subtitle = 'Color-coded variance flags: Red for Overpayment, Yellow for Underpayment',
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
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="p-6 pb-3 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-xs rounded-lg transition ${
                filter === key
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 font-medium'
              }`}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold tracking-wider uppercase text-[10px]">
            <tr>
              <th scope="col" className="py-3 px-4">Property Address</th>
              <th scope="col" className="py-3 px-4">Sale Price</th>
              <th scope="col" className="py-3 px-4">Comm %</th>
              <th scope="col" className="py-3 px-4">Splits (L / B / Cut)</th>
              <th scope="col" className="py-3 px-4">Referrals &amp; Fee</th>
              <th scope="col" className="py-3 px-4">Expected Pay</th>
              <th scope="col" className="py-3 px-4">Actual Paid</th>
              <th scope="col" className="py-3 px-4">Discrepancy</th>
              <th scope="col" className="py-3 px-4">Audit Status</th>
              {!readOnly && (
                <th scope="col" className="py-3 px-4 text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {visible.map((transaction) => {
              const audit = calculateAudit(transaction);
              return (
                <tr key={transaction.id} className="hover:bg-slate-50/80 transition-colors">
                  <td
                    className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate"
                    title={transaction.address}
                  >
                    <div className="truncate font-semibold text-slate-800">{transaction.address}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {transaction.id}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {formatMoney(transaction.salePrice)}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {formatPercent(transaction.commRate)}
                    <div className="text-[10px] text-slate-400">
                      {formatMoney(audit.totalCommission)} total
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="text-slate-800 font-medium">
                      {formatPercent(transaction.listingSplit)}
                    </span>{' '}
                    L / {formatPercent(transaction.buyerSplit)} B
                    <div className="text-[10px] text-slate-500">
                      Brok Cut: {formatPercent(transaction.brokerSplit)} (
                      {formatMoney(audit.brokerageCut)})
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>
                      Ref Out: {formatPercent(transaction.referralOut)} (
                      {formatMoney(audit.referralFeeOutAmount)})
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Trans Fee: {formatMoney(transaction.transactionFee)}
                    </div>
                    {audit.hasMissingReferral && (
                      <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Missing In: {formatMoney(transaction.referralIn)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {formatMoney(audit.expectedAgentPayment)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {formatMoney(transaction.actualPaid)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold ${
                        audit.status === 'overpaid'
                          ? 'text-rose-600'
                          : audit.status === 'underpaid'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                      }`}
                    >
                      {(audit.discrepancy > 0 ? '+' : '') + formatMoney(audit.discrepancy)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {audit.status === 'overpaid' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
                        OVERPAID (+{formatMoney(audit.discrepancy)})
                      </span>
                    )}
                    {audit.status === 'underpaid' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                        UNDERPAID ({formatMoney(audit.discrepancy)})
                      </span>
                    )}
                    {audit.status === 'correct' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        Accurate
                      </span>
                    )}
                  </td>
                  {!readOnly && (
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onInspect?.(transaction)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                        title="Inspect Formula Calculation"
                        aria-label={`Inspect calculation for ${transaction.address}`}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(transaction.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition"
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
          <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">
            {transactions.length === 0 ? 'No Transactions Recorded' : 'No Transactions Match Filter'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {transactions.length === 0
              ? readOnly
                ? 'This audit does not contain any transactions yet.'
                : 'Add a transaction, import a CSV, or load the sample records.'
              : 'Adjust your filter options to see more records.'}
          </p>
        </div>
      )}

      <div className="px-6 py-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span>
          Showing {visible.length} of {transactions.length} transactions
        </span>
        <span>Zed Automation Internal Audit Algorithm v2.4</span>
      </div>
    </section>
  );
}
