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
  /** Absolute read-only URL, e.g. https://audit.zedautomations.tech/commission-audit/view/au-123 */
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
        ? 'Send it to your client — they can view KPIs, transactions, and Executive Reports without editing.'
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
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-audit-title"
        className="bg-[#0B1120] rounded-2xl w-full max-w-xl shadow-2xl border border-slate-800/80 my-auto text-slate-100"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#10B981] text-[#05080F] flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="share-audit-title" className="text-base font-bold text-white">
                Share with client
              </h2>
              <p className="text-xs text-slate-400">
                Generates a read-only link to this audit — no operator key required.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-slate-800/80 bg-[#05080F] p-4">
            <p className="text-xs font-semibold text-white">
              {audit?.name ?? 'No audit selected'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {client ? `${client.name}${client.company ? ` — ${client.company}` : ''}` : 'No client'}
              {audit ? ` · ${audit.transactions.length} transaction${audit.transactions.length === 1 ? '' : 's'}` : ''}
            </p>
          </div>

          <div>
            <label
              htmlFor="share-url"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5"
            >
              <Link2 className="w-3.5 h-3.5 text-[#10B981]" />
              Read-only link
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="share-url"
                type="text"
                readOnly
                value={shareUrl}
                onFocus={(event) => event.currentTarget.select()}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-800 bg-[#05080F] text-xs font-mono text-slate-200 outline-none focus:ring-2 focus:ring-[#10B981]/50"
              />
              <button
                type="button"
                onClick={handleCopy}
                disabled={!shareUrl}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#10B981] text-[#05080F] hover:bg-emerald-400 transition shadow-sm disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-[#05080F] p-4 space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Eye className="w-3.5 h-3.5 text-[#10B981]" />
              What your client sees
            </p>
            <p className="text-[11px] text-slate-400">
              KPI dashboard, the full transaction table, and the Executive PDF &amp; Text Summary download.
            </p>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 pt-1">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              What is hidden
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              {hidden.map((item) => (
                <li key={item} className="text-[11px] text-slate-500">
                  &bull; {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-slate-500">
            The link resolves against this browser&apos;s local storage — export the PDF or copyable text summary for cross-device delivery.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-800/80 px-6 py-4 bg-[#05080F]/70 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#0B1120] border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
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
                ? 'bg-slate-800 text-white hover:bg-slate-700'
                : 'bg-slate-900 text-slate-600 pointer-events-none'
            }`}
          >
            <ExternalLink className="w-4 h-4 text-[#10B981]" />
            Open read-only view
          </a>
        </div>
      </div>
    </div>
  );
}
