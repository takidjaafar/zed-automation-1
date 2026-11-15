'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, FileText, Link2Off, Loader2, Lock } from 'lucide-react';

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
 * Intentionally un-gated so managing brokers can view shared audits directly.
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
      <div className="min-h-screen bg-[#05080F] flex items-center justify-center text-sm text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#10B981]" />
        Loading shared audit…
      </div>
    );
  }

  if (!audit || !client) {
    return (
      <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center px-4 py-16">
        <div className="bg-[#0B1120] rounded-2xl border border-slate-800/80 shadow-2xl p-8 max-w-lg text-center">
          <Link2Off className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h1 className="text-base font-bold text-white">This audit link is not available here</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Shared audits are stored in the browser that created them, so this link only resolves on
            the browser profile that generated it. Request the Executive PDF or Text Summary from your Zed Automation desk.
          </p>
          <p className="text-[11px] text-slate-500 mt-3 font-mono break-all">audit id: {auditId}</p>
          <a
            href="https://zedautomation.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#10B981] text-[#05080F] hover:bg-emerald-400 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Zed Automation
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080F] text-slate-100 flex flex-col font-sans">
      <header className="bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <AuditBrand tag="Client Fulfillment Portal · Read-Only" />

          <div className="flex items-center gap-4 shrink-0">
            <a
              href="https://zedautomation.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-[#10B981] transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Zed Automation
            </a>
            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#10B981] text-[#05080F] hover:bg-emerald-400 transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Executive Report
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <section className="rounded-2xl border border-slate-800/80 bg-[#0B1120] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">{audit.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {client.name}
              {client.company ? ` — ${client.company}` : ''} &middot; prepared by Zed Automation
            </p>
          </div>
          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-[#10B981] font-medium">
              <Eye className="w-3.5 h-3.5" />
              Read-only client view
            </span>
            <span className="font-mono tabular-nums">
              {formatReportDate(audit.periodStart)} – {formatReportDate(audit.periodEnd)}
            </span>
          </div>
        </section>

        <AuditKpiDashboard transactions={audit.transactions} />

        <TransactionTable
          transactions={audit.transactions}
          readOnly
          title="Audited Commission Log"
          subtitle="Read-only variance ledger — Rose for Overpayment, Amber for Underpayment"
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

      <footer className="bg-[#0B1120] border-t border-slate-800/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; Zed Automation &mdash; Confidential commission audit prepared for {client.name}</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <Lock className="w-3 h-3" />
              Read-only share link
            </span>
            <span>&middot;</span>
            <Link href="/" className="text-[#10B981] hover:underline">
              Portal Home
            </Link>
          </div>
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
