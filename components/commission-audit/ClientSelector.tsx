'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, FolderOpen, Plus, Share2, Users } from 'lucide-react';

import type { AuditRecord, Client } from '@/types/commission-audit';

export interface ClientSelectorProps {
  clients: Client[];
  activeClientId: string | null;
  audits: AuditRecord[];
  activeAuditId: string | null;
  onSelectClient: (clientId: string) => void;
  onSelectAudit: (auditId: string) => void;
  onNewAudit: () => void;
  onShare: () => void;
  disabled?: boolean;
}

/**
 * Client + audit switcher shown at the top of the commission audit workspace.
 * Selecting a client swaps in that client's independently stored audits.
 */
export default function ClientSelector({
  clients,
  activeClientId,
  audits,
  activeAuditId,
  onSelectClient,
  onSelectAudit,
  onNewAudit,
  onShare,
  disabled = false,
}: ClientSelectorProps) {
  const hasClients = clients.length > 0;
  const hasAudits = audits.length > 0;

  return (
    <section className="bg-[#0B1210]/90 backdrop-blur-xl rounded-2xl border border-emerald-400/15 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        {/* Client */}
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="client-selector"
            className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-[#10B981]" />
            Client Brokerage
          </label>
          <select
            id="client-selector"
            value={activeClientId ?? ''}
            disabled={disabled || !hasClients}
            onChange={(event) => onSelectClient(event.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-emerald-400/20 text-sm bg-[#040807]/90 text-white outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-[#10B981] disabled:opacity-50"
          >
            {!hasClients && <option value="">No clients yet</option>}
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
                {client.company ? ` — ${client.company}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Audit */}
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="audit-selector"
            className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#10B981]" />
            Active Audit Period
          </label>
          <select
            id="audit-selector"
            value={activeAuditId ?? ''}
            disabled={disabled || !hasAudits}
            onChange={(event) => onSelectAudit(event.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-emerald-400/20 text-sm bg-[#040807]/90 text-white outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-[#10B981] disabled:opacity-50"
          >
            {!hasAudits && <option value="">No audits yet</option>}
            {audits.map((audit) => (
              <option key={audit.id} value={audit.id}>
                {audit.name} ({audit.transactions.length}{' '}
                {audit.transactions.length === 1 ? 'deal' : 'deals'})
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onNewAudit}
            disabled={disabled || !hasClients}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-lg bg-[#10B981] text-[#040807] hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.22)] transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Audit
          </button>
          <button
            type="button"
            onClick={onShare}
            disabled={disabled || !activeAuditId}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-lg bg-[#040807]/85 border border-emerald-400/25 text-slate-200 hover:border-emerald-400/50 hover:text-emerald-200 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#10B981]" />
            Share with Client
          </button>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-lg bg-[#040807]/85 border border-white/10 text-slate-300 hover:text-white hover:border-emerald-400/30 transition whitespace-nowrap shrink-0"
          >
            <Users className="w-3.5 h-3.5" />
            Clients
          </Link>
        </div>
      </div>

      {hasClients && activeClientId && (
        <p className="mt-3 text-xs text-slate-400">
          Each brokerage&apos;s audits are isolated in encrypted browser storage so client ledgers never mix.
        </p>
      )}
    </section>
  );
}
