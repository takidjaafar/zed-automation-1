'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format, startOfMonth, subMonths } from 'date-fns';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { z } from 'zod';

import { useToast } from '@/components/commission-audit/toast';
import { copyTextToClipboard } from '@/lib/commission-audit/clipboard';
import {
  buildReportBundle,
  formatExecutiveTextSummary,
} from '@/lib/commission-audit/report-data';
import { formatMoney, formatSignedMoney } from '@/lib/commission-audit/format';
import type { Transaction } from '@/types/commission-audit';

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

export interface PdfReportDialogProps {
  open: boolean;
  onClose: () => void;
  transactions: Transaction[];
  /** Pre-fills the client name (e.g. from the selected client). */
  defaultClientName?: string;
  defaultCompany?: string;
  /** Pre-fills the async contact email used in the report footer. */
  defaultContactEmail?: string;
  /** Prevents editing the client/company fields (client-portal view). */
  lockClient?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Validation                                                                */
/* -------------------------------------------------------------------------- */

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

const reportFormSchema = z
  .object({
    clientName: z
      .string()
      .trim()
      .min(1, 'Client name is required — it appears on the cover page and in the filename.')
      .max(120, 'Client name must be 120 characters or fewer.'),
    company: z.string().trim().max(120, 'Company must be 120 characters or fewer.').optional(),
    periodStart: z.string().regex(ISO_DAY, 'Choose a valid start date.'),
    periodEnd: z.string().regex(ISO_DAY, 'Choose a valid end date.'),
    preparedBy: z.string().trim().max(120, 'Prepared by must be 120 characters or fewer.').optional(),
    contactEmail: z
      .union([z.literal(''), z.string().trim().email('Enter a valid contact email address.')])
      .optional(),
  })
  .refine((value) => value.periodStart <= value.periodEnd, {
    message: 'The period end must be on or after the period start.',
    path: ['periodEnd'],
  });

type ReportFormValues = z.infer<typeof reportFormSchema>;

type FieldErrors = Partial<Record<keyof ReportFormValues, string>>;

function defaultPeriod(): { periodStart: string; periodEnd: string } {
  const today = new Date();
  return {
    periodStart: format(startOfMonth(subMonths(today, 3)), 'yyyy-MM-dd'),
    periodEnd: format(today, 'yyyy-MM-dd'),
  };
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function PdfReportDialog({
  open,
  onClose,
  transactions,
  defaultClientName = '',
  defaultCompany = '',
  defaultContactEmail = '',
  lockClient = false,
}: PdfReportDialogProps) {
  const { push } = useToast();

  const [activeTab, setActiveTab] = useState<'pdf' | 'text'>('pdf');
  const [clientName, setClientName] = useState(defaultClientName);
  const [company, setCompany] = useState(defaultCompany);
  const [periodStart, setPeriodStart] = useState(() => defaultPeriod().periodStart);
  const [periodEnd, setPeriodEnd] = useState(() => defaultPeriod().periodEnd);
  const [preparedBy, setPreparedBy] = useState('');
  const [contactEmail, setContactEmail] = useState(defaultContactEmail);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ fileName: string; pageCount: number } | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  // Re-seed the form each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    const period = defaultPeriod();
    setActiveTab('pdf');
    setClientName(defaultClientName);
    setCompany(defaultCompany);
    setPeriodStart(period.periodStart);
    setPeriodEnd(period.periodEnd);
    setPreparedBy('');
    setContactEmail(defaultContactEmail);
    setErrors({});
    setFailure(null);
    setSuccess(null);
    setCopiedSummary(false);
  }, [open, defaultClientName, defaultCompany, defaultContactEmail]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => firstFieldRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isGenerating) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, isGenerating, onClose]);

  const bundle = useMemo(
    () =>
      buildReportBundle(transactions, {
        clientName: clientName.trim() || defaultClientName || 'Brokerage Client',
        company,
        periodStart,
        periodEnd,
        preparedBy,
        contactEmail,
        reportDate: new Date(),
      }),
    [transactions, clientName, defaultClientName, company, periodStart, periodEnd, preparedBy, contactEmail],
  );

  const executiveTextSummary = useMemo(() => formatExecutiveTextSummary(bundle), [bundle]);
  const hasTransactions = transactions.length > 0;

  const handleGenerate = useCallback(async () => {
    const candidate: ReportFormValues = {
      clientName,
      company,
      periodStart,
      periodEnd,
      preparedBy,
      contactEmail,
    };

    const parsed = reportFormSchema.safeParse(candidate);
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof ReportFormValues | undefined;
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      });
      setErrors(nextErrors);
      setSuccess(null);
      setActiveTab('pdf');
      return;
    }

    setErrors({});
    setFailure(null);
    setSuccess(null);
    setIsGenerating(true);

    try {
      // Loaded on demand so the ~350 kB jsPDF bundle stays out of the page bundle.
      const { downloadAuditReportPdf } = await import('@/lib/commission-audit/report-pdf');
      const result = downloadAuditReportPdf(transactions, {
        clientName: parsed.data.clientName,
        company: parsed.data.company ?? '',
        periodStart: parsed.data.periodStart,
        periodEnd: parsed.data.periodEnd,
        preparedBy: parsed.data.preparedBy ?? '',
        contactEmail: parsed.data.contactEmail ?? '',
        reportDate: new Date(),
      });
      setSuccess({ fileName: result.fileName, pageCount: result.pageCount });
    } catch (error) {
      setFailure(
        error instanceof Error
          ? `The report could not be generated: ${error.message}`
          : 'The report could not be generated. Please try again.',
      );
    } finally {
      setIsGenerating(false);
    }
  }, [clientName, company, contactEmail, periodEnd, periodStart, preparedBy, transactions]);

  const handleCopyTextSummary = useCallback(async () => {
    const copied = await copyTextToClipboard(executiveTextSummary);
    setCopiedSummary(copied);
    push({
      tone: copied ? 'success' : 'error',
      title: copied ? 'Executive Summary copied' : 'Copy failed',
      description: copied
        ? 'Paste directly into your written client email or message.'
        : 'Select the text in the summary panel and copy manually.',
    });
    if (copied) {
      window.setTimeout(() => setCopiedSummary(false), 2500);
    }
  }, [executiveTextSummary, push]);

  if (!open) return null;

  const fieldClass = (hasError: boolean) =>
    `w-full px-3 py-2 rounded-lg border text-sm outline-none transition bg-[#05080F] text-white placeholder:text-slate-600 focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] ${
      hasError ? 'border-rose-500/70' : 'border-slate-800'
    }`;

  const { summary, recoveryProtocol } = bundle;

  const kpiTiles = [
    { label: 'Transactions audited', value: String(summary.totalTransactions), tone: 'text-white' },
    { label: 'Total overpaid', value: formatMoney(summary.totalOverpaid), tone: 'text-rose-400' },
    { label: 'Total underpaid', value: formatMoney(summary.totalUnderpaid), tone: 'text-amber-400' },
    {
      label: 'Missing referral income',
      value: formatMoney(summary.totalMissingReferral),
      tone: 'text-indigo-400',
    },
    {
      label: 'Net discrepancy',
      value: formatSignedMoney(summary.netDiscrepancy),
      tone:
        summary.netDiscrepancy > 0.5
          ? 'text-rose-400'
          : summary.netDiscrepancy < -0.5
            ? 'text-amber-400'
            : 'text-[#10B981]',
    },
    {
      label: 'Total Flagged GCI Leakage',
      value: formatMoney(recoveryProtocol.totalFlaggedLeakage),
      tone: 'text-rose-400',
    },
    {
      label: 'Projected 90-Day Net Recovery',
      value: formatMoney(recoveryProtocol.projected90DayNetRecovery),
      tone: 'text-[#10B981]',
    },
  ];

  const sections = [
    'Cover page — Zed Automation branding, client, audit period, report date & confidentiality note',
    'Executive summary — totals for overpayments, shortfalls, missing referrals & narrative',
    'Detailed findings — every transaction with expected vs actual payout and variance status',
    'Top 5 discrepancies — largest variances with full line-by-line calculation trace',
    '90-Day Recovery Protocol & Next Steps — total leakage, projected recovery & async activation instructions',
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isGenerating) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-report-title"
        className="bg-[#0B1120] rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-800/80 my-auto text-slate-100"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#10B981] text-[#05080F] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="pdf-report-title" className="text-base font-bold text-white">
                Executive Report &amp; Silent Closer
              </h2>
              <p className="text-xs text-slate-400">
                Client-ready PDF &amp; copyable written briefing &middot; {transactions.length} transaction
                {transactions.length === 1 ? '' : 's'} included
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#05080F] border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('pdf')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'pdf'
                    ? 'bg-[#10B981] text-[#05080F]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                PDF Export
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'text'
                    ? 'bg-[#10B981] text-[#05080F]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Copyable Text Summary
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              aria-label="Close"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === 'pdf' ? (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Form */}
            <div className="lg:col-span-3 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="report-client"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Client name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="report-client"
                    ref={firstFieldRef}
                    type="text"
                    value={clientName}
                    readOnly={lockClient}
                    onChange={(event) => setClientName(event.target.value)}
                    placeholder="e.g. Acme Realty Group"
                    className={`${fieldClass(Boolean(errors.clientName))} ${
                      lockClient ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  />
                  {errors.clientName ? (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.clientName}</p>
                  ) : (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Printed on the cover page and used in the filename.
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="report-company"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Company / brokerage
                  </label>
                  <input
                    id="report-company"
                    type="text"
                    value={company}
                    readOnly={lockClient}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="e.g. Acme Realty Group LLC"
                    className={`${fieldClass(Boolean(errors.company))} ${
                      lockClient ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  />
                  {errors.company && <p className="text-[11px] text-rose-400 mt-1">{errors.company}</p>}
                </div>

                <div>
                  <label
                    htmlFor="report-period-start"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Period start <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="report-period-start"
                    type="date"
                    value={periodStart}
                    onChange={(event) => setPeriodStart(event.target.value)}
                    className={fieldClass(Boolean(errors.periodStart))}
                  />
                  {errors.periodStart && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.periodStart}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="report-period-end"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Period end <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="report-period-end"
                    type="date"
                    value={periodEnd}
                    onChange={(event) => setPeriodEnd(event.target.value)}
                    className={fieldClass(Boolean(errors.periodEnd))}
                  />
                  {errors.periodEnd && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.periodEnd}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="report-prepared-by"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Prepared by
                  </label>
                  <input
                    id="report-prepared-by"
                    type="text"
                    value={preparedBy}
                    onChange={(event) => setPreparedBy(event.target.value)}
                    placeholder="Zed Automation Audit Desk"
                    className={fieldClass(Boolean(errors.preparedBy))}
                  />
                  {errors.preparedBy && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.preparedBy}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="report-contact-email"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Async reply email
                  </label>
                  <input
                    id="report-contact-email"
                    type="email"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    placeholder="zakaria@zedautomations.tech"
                    className={fieldClass(Boolean(errors.contactEmail))}
                  />
                  {errors.contactEmail && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.contactEmail}</p>
                  )}
                </div>
              </div>

              {failure && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-950/30 p-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-rose-200">{failure}</p>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-emerald-200">
                      {success.fileName} downloaded
                    </p>
                    <p className="text-[11px] text-emerald-300/80">
                      {success.pageCount}-page report generated from {transactions.length} transaction
                      {transactions.length === 1 ? '' : 's'}.
                    </p>
                  </div>
                </div>
              )}

              {!hasTransactions && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-950/30 p-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-amber-200">
                    There are no transactions to report on. Import a CSV or add a transaction first —
                    the report will still generate, but it will contain no findings.
                  </p>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-slate-800/80 bg-[#05080F] p-4">
                <p className="text-xs font-semibold text-slate-400 mb-3">
                  Snapshot in this report
                </p>
                <div className="space-y-2.5">
                  {kpiTiles.map((tile) => (
                    <div key={tile.label} className="flex items-baseline justify-between gap-3">
                      <span className="text-[11px] text-slate-400">{tile.label}</span>
                      <span className={`text-sm font-bold font-mono tabular-nums ${tile.tone}`}>
                        {tile.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-[#05080F] p-4">
                <p className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  Included in PDF &amp; Text Summary
                </p>
                <ul className="space-y-2">
                  {sections.map((section) => (
                    <li key={section} className="flex items-start gap-2 text-[11px] text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] mt-0.5 flex-shrink-0" />
                      {section}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-800/80 bg-[#05080F] p-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  Silent Closer Written Summary
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Includes Flagged GCI Leakage, Projected 90-Day Net Recovery, and 100% async written deployment instructions.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyTextSummary}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#05080F] transition cursor-pointer whitespace-nowrap shrink-0"
              >
                {copiedSummary ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedSummary ? 'Copied to Clipboard' : 'Copy Executive Summary'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-800/80 bg-[#05080F] p-3.5">
                <span className="text-[11px] text-slate-400">Total Flagged GCI Leakage</span>
                <p className="mt-1 text-lg font-bold font-mono tabular-nums text-rose-400">
                  {formatMoney(recoveryProtocol.totalFlaggedLeakage)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-[#05080F] p-3.5">
                <span className="text-[11px] text-slate-400">45s Speed-to-Lead 90-Day Uplift</span>
                <p className="mt-1 text-lg font-bold font-mono tabular-nums text-slate-200">
                  +{formatMoney(recoveryProtocol.speedToLeadUplift90d)}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
                <span className="text-[11px] text-[#10B981] font-medium">Projected 90-Day Net Recovery</span>
                <p className="mt-1 text-lg font-bold font-mono tabular-nums text-[#10B981]">
                  {formatMoney(recoveryProtocol.projected90DayNetRecovery)}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="executive-text-summary" className="sr-only">
                Copyable Executive Summary
              </label>
              <textarea
                id="executive-text-summary"
                readOnly
                value={executiveTextSummary}
                rows={14}
                onFocus={(event) => event.currentTarget.select()}
                className="w-full rounded-xl border border-slate-800 bg-[#05080F] p-4 font-mono text-xs text-slate-200 leading-relaxed outline-none focus:ring-2 focus:ring-[#10B981]/50"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 px-6 py-4 bg-[#05080F]/70 rounded-b-2xl">
          <p className="text-[11px] text-slate-400">
            Filename:{' '}
            <span className="font-mono text-slate-300">
              Commission_Audit_{(clientName.trim() || 'Client').replace(/[^\p{L}\p{N}]+/gu, '_')}_
              {format(new Date(), 'yyyy-MM-dd')}.pdf
            </span>
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[#0B1120] border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/60 transition disabled:opacity-50"
            >
              {success ? 'Close' : 'Cancel'}
            </button>
            {activeTab === 'text' && (
              <button
                type="button"
                onClick={handleCopyTextSummary}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition cursor-pointer"
              >
                {copiedSummary ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4 text-[#10B981]" />}
                {copiedSummary ? 'Copied' : 'Copy Text Summary'}
              </button>
            )}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg bg-[#10B981] text-[#05080F] hover:bg-emerald-400 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {isGenerating ? 'Generating…' : 'Generate PDF Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
