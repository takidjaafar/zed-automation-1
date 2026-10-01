/**
 * The commission audit calculation engine.
 *
 * This is the single source of truth for the audit formula. It was originally
 * inline in `app/commission-audit/page.tsx`; it now lives here so the page,
 * the CSV importer, the PDF report and every future surface compute identical
 * numbers.
 *
 * Formula
 *  1. Total Commission       = Sale Price × (Total Commission Rate / 100)
 *  2. Listing Commission     = Total Commission × (Listing Split / 100)
 *  3. Buyer Commission       = Total Commission × (Buyer Split / 100)
 *  4. Referral Fee Out       = Listing Commission × (Referral Fee Out / 100)
 *  5. Amount After Referral  = Listing Commission − Referral Fee Out
 *  6. Brokerage Cut          = Amount After Referral × (Brokerage Split / 100)
 *  7. Expected Agent Payment = Amount After Referral − Brokerage Cut − Transaction Fee
 *  8. Discrepancy            = Actual Paid − Expected Agent Payment
 */

import type { AuditResult, AuditStatus, Transaction } from '@/types/commission-audit';

/** Discrepancies inside ±$0.50 are treated as rounding noise, not errors. */
export const DISCREPANCY_TOLERANCE = 0.5;

/** Coerce anything spreadsheet-ish into a finite number. */
function num(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Run the audit formula for a single transaction. */
export function calculateAudit(transaction: Transaction): AuditResult {
  const price = num(transaction?.salePrice);
  const rate = num(transaction?.commRate);
  const listSplit = num(transaction?.listingSplit);
  const buyerSplitValue = num(transaction?.buyerSplit);
  const brokerageSplit = num(transaction?.brokerSplit);
  const referralOutPct = num(transaction?.referralOut);
  const referralInAmount = num(transaction?.referralIn);
  const fee = num(transaction?.transactionFee);
  const paid = num(transaction?.actualPaid);

  const totalCommission = price * (rate / 100);
  const listingCommission = totalCommission * (listSplit / 100);
  const buyerCommission = totalCommission * (buyerSplitValue / 100);
  const referralFeeOutAmount = listingCommission * (referralOutPct / 100);
  const amountAfterReferral = listingCommission - referralFeeOutAmount;
  const brokerageCut = amountAfterReferral * (brokerageSplit / 100);
  const expectedAgentPayment = amountAfterReferral - brokerageCut - fee;
  const discrepancy = paid - expectedAgentPayment;

  let status: AuditStatus = 'correct';
  let statusText = 'Accurate';
  const rounded = Math.round(discrepancy * 100) / 100;

  if (rounded > DISCREPANCY_TOLERANCE) {
    status = 'overpaid';
    statusText = 'Broker Overpaid';
  } else if (rounded < -DISCREPANCY_TOLERANCE) {
    status = 'underpaid';
    statusText = 'Broker Underpaid';
  }

  return {
    totalCommission,
    listingCommission,
    buyerCommission,
    referralFeeOutAmount,
    amountAfterReferral,
    brokerageCut,
    expectedAgentPayment,
    discrepancy,
    status,
    statusText,
    hasMissingReferral: referralInAmount > 0,
  };
}

/** Aggregate KPIs across a set of transactions. */
export interface AuditSummary {
  totalTransactions: number;
  /** Sum of positive discrepancies — money the brokerage paid out above contract. */
  totalOverpaid: number;
  /** Sum of |negative discrepancies| — money still owed to agents. */
  totalUnderpaid: number;
  /** Uncollected incoming referral fees (raw `referralIn` amounts). */
  totalMissingReferral: number;
  /** totalOverpaid − totalUnderpaid (positive = net brokerage leakage). */
  netDiscrepancy: number;
  overpaidCount: number;
  underpaidCount: number;
  correctCount: number;
  /** Deals carrying an outstanding incoming referral fee. */
  referralCount: number;
  /** overpaidCount + underpaidCount. */
  discrepancyCount: number;
  totalSalePrice: number;
  totalCommission: number;
  totalBrokerageCut: number;
  totalExpectedAgentPayment: number;
  totalActualPaid: number;
  largestOverpay: number;
  largestUnderpay: number;
}

/** Aggregate the audit result of every transaction into dashboard/report KPIs. */
export function summarizeAudit(transactions: Transaction[]): AuditSummary {
  const summary: AuditSummary = {
    totalTransactions: transactions.length,
    totalOverpaid: 0,
    totalUnderpaid: 0,
    totalMissingReferral: 0,
    netDiscrepancy: 0,
    overpaidCount: 0,
    underpaidCount: 0,
    correctCount: 0,
    referralCount: 0,
    discrepancyCount: 0,
    totalSalePrice: 0,
    totalCommission: 0,
    totalBrokerageCut: 0,
    totalExpectedAgentPayment: 0,
    totalActualPaid: 0,
    largestOverpay: 0,
    largestUnderpay: 0,
  };

  transactions.forEach((transaction) => {
    const audit = calculateAudit(transaction);

    summary.totalSalePrice += num(transaction.salePrice);
    summary.totalCommission += audit.totalCommission;
    summary.totalBrokerageCut += audit.brokerageCut;
    summary.totalExpectedAgentPayment += audit.expectedAgentPayment;
    summary.totalActualPaid += num(transaction.actualPaid);

    if (audit.status === 'overpaid') {
      summary.totalOverpaid += audit.discrepancy;
      summary.overpaidCount += 1;
      summary.discrepancyCount += 1;
      summary.largestOverpay = Math.max(summary.largestOverpay, audit.discrepancy);
    } else if (audit.status === 'underpaid') {
      summary.totalUnderpaid += Math.abs(audit.discrepancy);
      summary.underpaidCount += 1;
      summary.discrepancyCount += 1;
      summary.largestUnderpay = Math.max(summary.largestUnderpay, Math.abs(audit.discrepancy));
    } else {
      summary.correctCount += 1;
    }

    if (audit.hasMissingReferral) {
      summary.totalMissingReferral += num(transaction.referralIn);
      summary.referralCount += 1;
    }

    summary.netDiscrepancy += audit.discrepancy;
  });

  return summary;
}

/** A transaction paired with its audit result. */
export interface AuditedTransaction {
  transaction: Transaction;
  audit: AuditResult;
  /** 1-based rank when sorted by absolute discrepancy. */
  rank: number;
}

/**
 * The largest discrepancies first, ranked by absolute dollar value.
 * Used by the "Top 5 Discrepancies" section of the PDF report.
 */
export function rankByDiscrepancy(
  transactions: Transaction[],
  limit = 5,
): AuditedTransaction[] {
  return transactions
    .map((transaction) => ({ transaction, audit: calculateAudit(transaction) }))
    .filter((entry) => entry.audit.status !== 'correct')
    .sort((a, b) => Math.abs(b.audit.discrepancy) - Math.abs(a.audit.discrepancy))
    .slice(0, Math.max(0, limit))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}
