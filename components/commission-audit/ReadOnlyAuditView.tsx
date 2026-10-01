'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, FileText, Link2Off, Lock, Loader2 } from 'lucide-react';

import AuditBrand from '@/components/commission-audit/AuditBrand';
import AuditKpiDashboard from '@/components/commission-audit/AuditKpiDashboard';
import PdfReportDialog from '@/components/commission-audit/PdfReportDialog';
import TransactionTable from '@/components/commission-audit/TransactionTable';
import { ToastProvider } from '@/components/commission-audit/toast';
import { findAudit } from '@/lib/commission-audit/storage';
import { formatReportDate } from '@/lib/commission-audit/report-data';
import type { AuditRecord, Client } from '@/types/commission-audit';

export interface ReadOnlyAuditViewProps {
  auditId: string;
}

/**
 * Read-only client portal view reached through the "Share with Client" link.
 *
 * Deliberately omits every editing affordance: no manual entry, no CSV import,
 * no sample data, no clear-all, no delete and no inspect actions. It shows the
 * KPI dashboard, the transaction table and a PDF report download.
 */
function ReadOnlyAuditView({ auditId }: ReadOnlyAuditViewProps) {
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    const found = findAudit(auditId);
    setClient(found?.client ?? null);
    setAudit(found?.audit ?? null);
    setLoading(false);
  }, [auditId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-emerald-500" />
        Loading shared audit…
      </div>
    );
  }

  if (!audit || !client) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-lg text-center">
          <Link2Off className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h1 className="text-base font-bold text-slate-900">This audit link is not available here</h1>
          <p className="text-xs text-slate-500 mt-2">
            Shared audits are stored in the browser that created them, so this link only works on
            the device and browser profile that generated it. Ask your auditor to export the PDF
            report instead.
          </p>
          <p className="text-[11px] text-slate-400 mt-3 font-mono break-all">audit id: {auditId}</p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            Back to Zed Automation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <AuditBrand
            subtitle={`Shared audit · ${client.name}`}
            badge={
              <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 inline-flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Read-only
              </span>
            }
          />
          <button
            onClick={() => setIsReportOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 transition shadow-sm shadow-emerald-500/20"
          >
            <FileText className="w-3.5 h-3.5" />
            Download PDF Report
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <section className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900">{audit.name}</p>
            <p className="text-xs text-slate-600 mt-0.5">
              {client.name}
              {client.company ? ` — ${client.company}` : ''} · prepared by Zed Automation
            </p>
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-600" />
              View only
            </span>
            <span>
              Period: {formatReportDate(audit.periodStart)} – {formatReportDate(audit.periodEnd)}
            </span>
          </div>
        </section>

        <AuditKpiDashboard transactions={audit.transactions} />

        <TransactionTable
          transactions={audit.transactions}
          readOnly
          title="Audited Commission Log"
          subtitle="Read-only view — colour-coded red for overpayment, yellow for underpayment"
        />
      </main>

      <PdfReportDialog
        open={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        transactions={audit.transactions}
        defaultClientName={client.name}
        defaultCompany={client.company}
        defaultContactEmail={client.email}
        lockClient
      />

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; Zed Automation — Confidential commission audit prepared for {client.name}</p>
          <p className="inline-flex items-center gap-1.5 text-slate-400">
            <Lock className="w-3 h-3" />
            Read-only share link
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function ReadOnlyAuditViewPage({ auditId }: ReadOnlyAuditViewProps) {
  return (
    <ToastProvider>
      <ReadOnlyAuditView auditId={auditId} />
    </ToastProvider>
  );
}
