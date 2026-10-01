'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format, startOfMonth, subMonths } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';
import { z } from 'zod';

import { summarizeAudit } from '@/lib/commission-audit/audit';
import { formatMoney, formatSignedMoney } from '@/lib/commission-audit/format';
import type { Transaction } from '@/types/commission-audit';

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

export interface PdfReportDialogProps {
  open: boolean;
  onClose: () => void;
  transactions: Transaction[];
  /** Pre-fills the client name (e.g. from the selected client in Feature 3). */
  defaultClientName?: string;
  defaultCompany?: string;
  /** Pre-fills the contact details used in the report footer. */
  defaultContactEmail?: string;
  defaultContactPhone?: string;
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
    contactPhone: z.string().trim().max(60, 'Phone must be 60 characters or fewer.').optional(),
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
  defaultContactPhone = '',
  lockClient = false,
}: PdfReportDialogProps) {
  const [clientName, setClientName] = useState(defaultClientName);
  const [company, setCompany] = useState(defaultCompany);
  const [periodStart, setPeriodStart] = useState(() => defaultPeriod().periodStart);
  const [periodEnd, setPeriodEnd] = useState(() => defaultPeriod().periodEnd);
  const [preparedBy, setPreparedBy] = useState('');
  const [contactEmail, setContactEmail] = useState(defaultContactEmail);
  const [contactPhone, setContactPhone] = useState(defaultContactPhone);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ fileName: string; pageCount: number } | null>(null);

  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  // Re-seed the form each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    const period = defaultPeriod();
    setClientName(defaultClientName);
    setCompany(defaultCompany);
    setPeriodStart(period.periodStart);
    setPeriodEnd(period.periodEnd);
    setPreparedBy('');
    setContactEmail(defaultContactEmail);
    setContactPhone(defaultContactPhone);
    setErrors({});
    setFailure(null);
    setSuccess(null);
  }, [open, defaultClientName, defaultCompany, defaultContactEmail, defaultContactPhone]);

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

  const summary = useMemo(() => summarizeAudit(transactions), [transactions]);
  const hasTransactions = transactions.length > 0;

  const handleGenerate = useCallback(async () => {
    const candidate: ReportFormValues = {
      clientName,
      company,
      periodStart,
      periodEnd,
      preparedBy,
      contactEmail,
      contactPhone,
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
        contactPhone: parsed.data.contactPhone ?? '',
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
  }, [
    clientName,
    company,
    contactEmail,
    contactPhone,
    periodEnd,
    periodStart,
    preparedBy,
    transactions,
  ]);

  if (!open) return null;

  const fieldClass = (hasError: boolean) =>
    `w-full px-3 py-2 rounded-lg border text-sm outline-none transition focus:ring-2 focus:ring-emerald-500 ${
      hasError ? 'border-rose-300 bg-rose-50' : 'border-slate-300 bg-white'
    }`;

  const kpiTiles = [
    { label: 'Transactions audited', value: String(summary.totalTransactions), tone: 'text-slate-800' },
    { label: 'Total overpaid', value: formatMoney(summary.totalOverpaid), tone: 'text-rose-600' },
    { label: 'Total underpaid', value: formatMoney(summary.totalUnderpaid), tone: 'text-amber-600' },
    {
      label: 'Missing referral income',
      value: formatMoney(summary.totalMissingReferral),
      tone: 'text-orange-600',
    },
    {
      label: 'Net discrepancy',
      value: formatSignedMoney(summary.netDiscrepancy),
      tone:
        summary.netDiscrepancy > 0.5
          ? 'text-rose-600'
          : summary.netDiscrepancy < -0.5
            ? 'text-amber-600'
            : 'text-emerald-600',
    },
  ];

  const sections = [
    'Cover page — Zed Automation branding, client, audit period, report date and confidentiality note',
    'Executive summary — totals for overpayments, underpayments and missing referral income, plus a plain-English narrative',
    'Detailed findings — every transaction with expected pay, actual pay, discrepancy and status, colour-coded by variance',
    'Top 5 discrepancies — the largest variances with a full calculation trace for each',
    'Recommendations — 3 to 5 specific, prioritised actions based on the findings',
    'Footer on every page — page numbers, "Generated by Zed Automation" and your audit contact details',
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isGenerating) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-report-title"
        className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 my-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="pdf-report-title" className="text-base font-bold text-slate-900">
                Generate PDF Report
              </h2>
              <p className="text-xs text-slate-500">
                Client-ready commission audit report · {transactions.length} transaction
                {transactions.length === 1 ? '' : 's'} included
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="report-client"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Client name <span className="text-rose-500">*</span>
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
                    lockClient ? 'bg-slate-100 text-slate-600' : ''
                  }`}
                />
                {errors.clientName ? (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.clientName}</p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Printed on the cover page and used in the filename.
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="report-company"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
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
                    lockClient ? 'bg-slate-100 text-slate-600' : ''
                  }`}
                />
                {errors.company && <p className="text-[11px] text-rose-600 mt-1">{errors.company}</p>}
              </div>

              <div>
                <label
                  htmlFor="report-period-start"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Period start <span className="text-rose-500">*</span>
                </label>
                <input
                  id="report-period-start"
                  type="date"
                  value={periodStart}
                  onChange={(event) => setPeriodStart(event.target.value)}
                  className={fieldClass(Boolean(errors.periodStart))}
                />
                {errors.periodStart && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.periodStart}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="report-period-end"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Period end <span className="text-rose-500">*</span>
                </label>
                <input
                  id="report-period-end"
                  type="date"
                  value={periodEnd}
                  onChange={(event) => setPeriodEnd(event.target.value)}
                  className={fieldClass(Boolean(errors.periodEnd))}
                />
                {errors.periodEnd && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.periodEnd}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="report-prepared-by"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Prepared by
                </label>
                <input
                  id="report-prepared-by"
                  type="text"
                  value={preparedBy}
                  onChange={(event) => setPreparedBy(event.target.value)}
                  placeholder="Your name — defaults to Zed Automation Audit Desk"
                  className={fieldClass(Boolean(errors.preparedBy))}
                />
                {errors.preparedBy && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.preparedBy}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="report-contact-email"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Contact email
                </label>
                <input
                  id="report-contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  placeholder="audit@zedautomation.com"
                  className={fieldClass(Boolean(errors.contactEmail))}
                />
                {errors.contactEmail && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.contactEmail}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="report-contact-phone"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Contact phone
                </label>
                <input
                  id="report-contact-phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  placeholder="(555) 010-2030"
                  className={fieldClass(Boolean(errors.contactPhone))}
                />
                {errors.contactPhone && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.contactPhone}</p>
                )}
              </div>
            </div>

            {failure && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
                <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-rose-800">{failure}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-emerald-900">
                    {success.fileName} downloaded
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    {success.pageCount}-page report generated from {transactions.length} transaction
                    {transactions.length === 1 ? '' : 's'}.
                  </p>
                </div>
              </div>
            )}

            {!hasTransactions && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-amber-800">
                  There are no transactions to report on. Import a CSV or add a transaction first —
                  the report will still generate, but it will contain no findings.
                </p>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Snapshot in this report
              </p>
              <div className="space-y-2">
                {kpiTiles.map((tile) => (
                  <div key={tile.label} className="flex items-baseline justify-between gap-3">
                    <span className="text-[11px] text-slate-600">{tile.label}</span>
                    <span className={`text-sm font-bold ${tile.tone}`}>{tile.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                What the PDF contains
              </p>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section} className="flex items-start gap-2 text-[11px] text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {section}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50/60 rounded-b-2xl">
          <p className="text-[11px] text-slate-500">
            Filename:{' '}
            <span className="font-mono text-slate-700">
              Commission_Audit_{(clientName.trim() || 'Client').replace(/[^\p{L}\p{N}]+/gu, '_')}_
              {format(new Date(), 'yyyy-MM-dd')}.pdf
            </span>
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              {success ? 'Close' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
