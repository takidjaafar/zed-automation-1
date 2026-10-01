'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Eye, ExternalLink, Link2, Lock, Share2, X } from 'lucide-react';

import { copyTextToClipboard } from '@/lib/commission-audit/clipboard';
import { useToast } from '@/components/commission-audit/toast';
import type { AuditRecord, Client } from '@/types/commission-audit';

export interface ShareAuditDialogProps {
  open: boolean;
  onClose: () => void;
  audit: AuditRecord | null;
  client: Client | null;
  /** Absolute read-only URL, e.g. https://host/commission-audit/view/au-123 */
  shareUrl: string;
}

/**
 * Generates the read-only client link for an audit.
 *
 * The linked view hides every editing affordance: no manual entry, no CSV
 * import, no sample data, no clear-all, no delete and no actions column.
 */
export default function ShareAuditDialog({
  open,
  onClose,
  audit,
  client,
  shareUrl,
}: ShareAuditDialogProps) {
  const [copied, setCopied] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    if (!open) return;
    setCopied(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const handleCopy = useCallback(async () => {
    const success = await copyTextToClipboard(shareUrl);
    setCopied(success);
    push({
      tone: success ? 'success' : 'error',
      title: success ? 'Read-only link copied' : 'Could not copy automatically',
      description: success
        ? 'Send it to your client — they can view the KPIs, transactions and PDF, but cannot edit anything.'
        : 'Select the link and copy it manually.',
    });
  }, [push, shareUrl]);

  if (!open) return null;

  const hidden = [
    'Manual transaction entry',
    'CSV import',
    'Load sample data',
    'Clear all records',
    'Delete and inspect actions',
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-audit-title"
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 my-auto"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="share-audit-title" className="text-base font-bold text-slate-900">
                Share with client
              </h2>
              <p className="text-xs text-slate-500">
                Generates a read-only link to this audit — no sign-in required.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs font-semibold text-slate-800">
              {audit?.name ?? 'No audit selected'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {client ? `${client.name}${client.company ? ` — ${client.company}` : ''}` : 'No client'}
              {audit ? ` · ${audit.transactions.length} transaction${audit.transactions.length === 1 ? '' : 's'}` : ''}
            </p>
          </div>

          <div>
            <label
              htmlFor="share-url"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              <Link2 className="w-3.5 h-3.5" />
              Read-only link
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="share-url"
                type="text"
                readOnly
                value={shareUrl}
                onFocus={(event) => event.currentTarget.select()}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleCopy}
                disabled={!shareUrl}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Eye className="w-3.5 h-3.5 text-cyan-600" />
              What your client sees
            </p>
            <p className="text-[11px] text-slate-600">
              KPI dashboard, the full transaction table and a one-click PDF report download.
            </p>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pt-1">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              What is hidden
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              {hidden.map((item) => (
                <li key={item} className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-slate-500">
            The link points at this browser&apos;s local storage — the audit must be present in this
            browser profile for the link to resolve.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50/60 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
          >
            Close
          </button>
          <a
            href={shareUrl || '#'}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!shareUrl}
            className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition ${
              shareUrl
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-slate-200 text-slate-400 pointer-events-none'
            }`}
          >
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            Open read-only view
          </a>
        </div>
      </div>
    </div>
  );
}
