/**
 * Report model builder for the commission audit PDF.
 *
 * Deliberately free of jsPDF/DOM so it can be unit tested in Node and reused
 * by other outputs (email templates, share links) later.
 */

import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';

import { rankByDiscrepancy, summarizeAudit } from '@/lib/commission-audit/audit';
import type { AuditedTransaction, AuditSummary } from '@/lib/commission-audit/audit';
import { formatMoney, formatPercent } from '@/lib/commission-audit/format';
import type { Transaction } from '@/types/commission-audit';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface ReportOptions {
  /** Shown on the cover, in the summary and in the filename. */
  clientName: string;
  company?: string;
  /** ISO `yyyy-MM-dd` — inclusive start of the audited period. */
  periodStart: string;
  /** ISO `yyyy-MM-dd` — inclusive end of the audited period. */
  periodEnd: string;
  preparedBy?: string;
  contactEmail?: string;
  contactPhone?: string;
  /** Defaults to "now". */
  reportDate?: Date;
}

export type RecommendationSeverity = 'critical' | 'warning' | 'info';

export interface AuditRecommendation {
  title: string;
  detail: string;
  severity: RecommendationSeverity;
}

/** Everything the PDF renderer needs, fully computed. */
export interface ReportBundle {
  clientName: string;
  company: string;
  periodLabel: string;
  periodDays: number;
  reportDateLabel: string;
  reportDateIso: string;
  preparedBy: string;
  contactEmail: string;
  contactPhone: string;
  summary: AuditSummary;
  topDiscrepancies: AuditedTransaction[];
  recommendations: AuditRecommendation[];
  executiveSummary: string;
}

/* -------------------------------------------------------------------------- */
/*  Defaults                                                                  */
/* -------------------------------------------------------------------------- */

export const REPORT_CONTACT_DEFAULTS = {
  email: 'audit@zedautomation.com',
  phone: '(555) 010-2030',
  preparedBy: 'Zed Automation Audit Desk',
} as const;

export const REPORT_MAX_RECOMMENDATIONS = 5;
export const REPORT_MIN_RECOMMENDATIONS = 3;

const MONTH_DAY_YEAR = 'MMMM d, yyyy';
const ISO_DAY = 'yyyy-MM-dd';

/* -------------------------------------------------------------------------- */
/*  Date helpers                                                              */
/* -------------------------------------------------------------------------- */

/** Parse an ISO day, returning `null` when it is missing/invalid. */
export function parseReportDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

/** `2025-04-01` -> `April 1, 2025` (with a readable fallback). */
export function formatReportDate(value: string | undefined | null): string {
  const parsed = parseReportDate(value);
  return parsed ? format(parsed, MONTH_DAY_YEAR) : '—';
}

/** Human label for the audited window, e.g. "January 1, 2025 – March 31, 2025". */
export function formatPeriodLabel(start: string, end: string): string {
  const from = parseReportDate(start);
  const to = parseReportDate(end);
  if (from && to) return `${format(from, MONTH_DAY_YEAR)} – ${format(to, MONTH_DAY_YEAR)}`;
  if (from) return `From ${format(from, MONTH_DAY_YEAR)}`;
  if (to) return `Through ${format(to, MONTH_DAY_YEAR)}`;
  return 'All transactions on record';
}

/** Inclusive day count of the reported period (0 when the dates are unusable). */
export function periodLengthInDays(start: string, end: string): number {
  const from = parseReportDate(start);
  const to = parseReportDate(end);
  if (!from || !to) return 0;
  const diff = differenceInCalendarDays(to, from);
  return diff >= 0 ? diff + 1 : 0;
}

/** `Commission_Audit_Acme_Realty_2025-06-30.pdf` */
export function buildReportFileName(clientName: string, date: Date = new Date()): string {
  const safeClient =
    sanitizeFileNamePart(clientName) || 'Client';
  return `Commission_Audit_${safeClient}_${format(date, ISO_DAY)}.pdf`;
}

/** Keep the filename portable across Windows/macOS/Linux and safe in URLs. */
export function sanitizeFileNamePart(value: string): string {
  return String(value ?? '')
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
}

/* -------------------------------------------------------------------------- */
/*  Recommendations                                                           */
/* -------------------------------------------------------------------------- */

/** Evergreen best practices used to top the list up to three items. */
function evergreenRecommendations(summary: AuditSummary): AuditRecommendation[] {
  const threshold = summary.totalSalePrice > 0
    ? formatMoney(Math.max(2500, Math.round((summary.totalSalePrice / Math.max(summary.totalTransactions, 1)) * 100) / 100))
    : '$2,500.00';

  return [
    {
      severity: 'info',
      title: 'Run this audit on a monthly close cadence',
      detail:
        'Leakage compounds. Auditing the disbursement ledger every month keeps variances small enough to correct in the current accounting period instead of writing them off at year end.',
    },
    {
      severity: 'info',
      title: 'Standardize the commission export you send to audit',
      detail:
        'Export every closed deal with: Property Address, Sale Price, Total Commission Rate, Listing Agent Split, Buyer Agent Split, Brokerage Split, Referral Fee Out, Referral Fee In, Transaction Fee and Actual Amount Paid. A consistent export removes manual re-keying and makes each audit directly comparable.',
    },
    {
      severity: 'info',
      title: `Add a second-approval step for disbursements above ${threshold}`,
      detail:
        'Requiring a second signature or system approval above a per-deal threshold catches transposition and split-percentage errors before money leaves the brokerage.',
    },
    {
      severity: 'info',
      title: 'Keep a referral fee register',
      detail:
        'Log every incoming and outgoing referral with its agreement, expected amount and expected date, then reconcile it against deposits each month so referral income never quietly goes missing.',
    },
    {
      severity: 'info',
      title: 'Retain audit evidence with the closing file',
      detail:
        'Store this report alongside the settlement statement and disbursement record. Written evidence of an independent audit shortens disputes with agents and satisfies brokerage record-keeping obligations.',
    },
  ];
}

/**
 * Build 3–5 recommendation items derived from the actual findings, topped up
 * with evergreen best practices.
 */
export function buildRecommendations(
  transactions: Transaction[],
  summary: AuditSummary,
): AuditRecommendation[] {
  const recommendations: AuditRecommendation[] = [];
  const total = Math.max(summary.totalTransactions, 1);
  const errorRate = summary.discrepancyCount / total;

  if (summary.totalOverpaid > 0.005) {
    recommendations.push({
      severity: 'critical',
      title: `Recover ${formatMoney(summary.totalOverpaid)} in overpayments`,
      detail: `The brokerage disbursed above the contractual split on ${summary.overpaidCount} of ${summary.totalTransactions} audited deal${
        summary.totalTransactions === 1 ? '' : 's'
      }, totalling ${formatMoney(
        summary.totalOverpaid,
      )}. Reconcile each against its settlement statement and issue an adjusting entry, agent ledger credit or repayment schedule. Largest single overpayment: ${formatMoney(
        summary.largestOverpay,
      )}.`,
    });
  }

  if (summary.totalUnderpaid > 0.005) {
    recommendations.push({
      severity: 'critical',
      title: `Settle ${formatMoney(summary.totalUnderpaid)} owed to agents`,
      detail: `${summary.underpaidCount} deal${
        summary.underpaidCount === 1 ? '' : 's'
      } underpaid the agent by ${formatMoney(
        summary.totalUnderpaid,
      )} in total. Unpaid compensation is the fastest route to an agent dispute — confirm the shortfall with the agent ledger and pay it promptly. Largest single shortfall: ${formatMoney(
        summary.largestUnderpay,
      )}.`,
    });
  }

  if (summary.totalMissingReferral > 0.005) {
    recommendations.push({
      severity: 'warning',
      title: `Invoice ${formatMoney(summary.totalMissingReferral)} in outstanding referral income`,
      detail: `An incoming referral fee totalling ${formatMoney(
        summary.totalMissingReferral,
      )} remains uncollected across ${summary.referralCount} deal${
        summary.referralCount === 1 ? '' : 's'
      }. Pull the referral agreements, confirm the amount and due date with the referring brokerage, and issue invoices for every outstanding fee.`,
    });
  }

  if (summary.discrepancyCount > 0 && errorRate >= 0.2) {
    recommendations.push({
      severity: 'warning',
      title: `Tighten disbursement controls — ${formatPercent(errorRate * 100)} of deals were mis-paid`,
      detail: `${summary.discrepancyCount} of ${summary.totalTransactions} deals (${formatPercent(
        errorRate * 100,
      )}) did not match the contract. A rate this high points at a process gap rather than isolated typos: re-check how commission splits are entered in the transaction management system and who verifies them before payout.`,
    });
  }

  if (summary.correctCount > 0 && summary.discrepancyCount > 0) {
    recommendations.push({
      severity: 'info',
      title: `${summary.correctCount} of ${summary.totalTransactions} deals reconciled perfectly — find out why`,
      detail:
        'The correctly-paid deals show that the intended process works. Compare them against the mis-paid deals and document the difference (agent, office, deal type, data source) so the reliable path becomes the default.',
    });
  }

  const pool = evergreenRecommendations(summary);
  let poolIndex = 0;
  while (recommendations.length < REPORT_MIN_RECOMMENDATIONS && poolIndex < pool.length) {
    recommendations.push(pool[poolIndex]);
    poolIndex += 1;
  }

  return recommendations.slice(0, REPORT_MAX_RECOMMENDATIONS);
}

/* -------------------------------------------------------------------------- */
/*  Executive summary                                                         */
/* -------------------------------------------------------------------------- */

/** One-paragraph, plain-English narrative for the executive summary page. */
export function buildExecutiveSummary(
  transactions: Transaction[],
  summary: AuditSummary,
  options: Pick<ReportOptions, 'clientName' | 'periodStart' | 'periodEnd'>,
): string {
  if (summary.totalTransactions === 0) {
    return `No closed transactions were supplied for ${
      options.clientName || 'this client'
    }, so no findings can be reported for ${formatPeriodLabel(
      options.periodStart,
      options.periodEnd,
    )}. Upload the transaction export for the period and re-run the audit.`;
  }

  const totalVolume = formatMoney(summary.totalSalePrice);
  const totalCommission = formatMoney(summary.totalCommission);
  const expected = formatMoney(summary.totalExpectedAgentPayment);
  const actual = formatMoney(summary.totalActualPaid);
  const cleanShare = formatPercent((summary.correctCount / summary.totalTransactions) * 100);

  const parts: string[] = [];

  parts.push(
    `${options.clientName || 'The brokerage'} closed ${summary.totalTransactions} audited transaction${
      summary.totalTransactions === 1 ? '' : 's'
    } totalling ${totalVolume} in sale volume during ${formatPeriodLabel(
      options.periodStart,
      options.periodEnd,
    )}, generating ${totalCommission} in gross commission.`,
  );

  if (summary.totalCommission > 0) {
    parts.push(
      `Agents should have received ${expected} but were actually paid ${actual}.`,
    );
  } else {
    parts.push('The exported records contain no commissionable sale value, so agent payouts could not be verified.');
  }

  if (summary.discrepancyCount === 0) {
    parts.push(
      `Every one of the ${summary.totalTransactions} deals reconciled to the contractual split exactly (${cleanShare} of the audited population).`,
    );
  } else {
    parts.push(
      `Overall, ${summary.discrepancyCount} of ${summary.totalTransactions} deals (${formatPercent(
        (summary.discrepancyCount / summary.totalTransactions) * 100,
      )}) did not match the contract, leaving a net variance of ${formatMoney(
        summary.netDiscrepancy,
      )}.`,
    );

    if (summary.totalOverpaid > 0.005) {
      parts.push(
        `The brokerage overpaid agents by ${formatMoney(summary.totalOverpaid)} across ${
          summary.overpaidCount
        } deal${summary.overpaidCount === 1 ? '' : 's'} — money that is recoverable and currently sitting outside the brokerage's control.`,
      );
    }

    if (summary.totalUnderpaid > 0.005) {
      parts.push(
        `${formatMoney(summary.totalUnderpaid)} remains owed to agents across ${
          summary.underpaidCount
        } deal${summary.underpaidCount === 1 ? '' : 's'}, which should be settled before it becomes a dispute.`,
      );
    }
  }

  if (summary.totalMissingReferral > 0.005) {
    parts.push(
      `Separately, ${formatMoney(summary.totalMissingReferral)} of expected incoming referral income tied to ${
        summary.referralCount
      } deal${summary.referralCount === 1 ? '' : 's'} has not been collected.`,
    );
  }

  parts.push(
    `In total, ${formatMoney(
      Math.abs(summary.netDiscrepancy) + summary.totalMissingReferral,
    )} of leakage and outstanding income is quantified in this report.`,
  );

  return parts.join(' ');
}

/* -------------------------------------------------------------------------- */
/*  Bundle                                                                    */
/* -------------------------------------------------------------------------- */

/** Compute the complete report bundle from transactions + user options. */
export function buildReportBundle(
  transactions: Transaction[],
  options: ReportOptions,
): ReportBundle {
  const summary = summarizeAudit(transactions);
  const reportDate = options.reportDate ?? new Date();
  const periodStart = options.periodStart ?? '';
  const periodEnd = options.periodEnd ?? '';

  return {
    clientName: options.clientName?.trim() || 'Unnamed Client',
    company: options.company?.trim() || '',
    periodLabel: formatPeriodLabel(periodStart, periodEnd),
    periodDays: periodLengthInDays(periodStart, periodEnd),
    reportDateLabel: format(reportDate, MONTH_DAY_YEAR),
    reportDateIso: format(reportDate, ISO_DAY),
    preparedBy: options.preparedBy?.trim() || REPORT_CONTACT_DEFAULTS.preparedBy,
    contactEmail: options.contactEmail?.trim() || REPORT_CONTACT_DEFAULTS.email,
    contactPhone: options.contactPhone?.trim() || REPORT_CONTACT_DEFAULTS.phone,
    summary,
    topDiscrepancies: rankByDiscrepancy(transactions, 5),
    recommendations: buildRecommendations(transactions, summary),
    executiveSummary: buildExecutiveSummary(transactions, summary, {
      clientName: options.clientName,
      periodStart,
      periodEnd,
    }),
  };
}
