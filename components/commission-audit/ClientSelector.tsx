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
    <section className="bg-[#0B1120] rounded-2xl border border-slate-800/80 p-5">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        {/* Client */}
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="client-selector"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-[#10B981]" />
            Client Brokerage
          </label>
          <select
            id="client-selector"
            value={activeClientId ?? ''}
            disabled={disabled || !hasClients}
            onChange={(event) => onSelectClient(event.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 text-sm bg-[#05080F] text-white outline-none focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] disabled:opacity-50"
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
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#10B981]" />
            Active Audit Period
          </label>
          <select
            id="audit-selector"
            value={activeAuditId ?? ''}
            disabled={disabled || !hasAudits}
            onChange={(event) => onSelectAudit(event.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 text-sm bg-[#05080F] text-white outline-none focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] disabled:opacity-50"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-lg bg-[#10B981] text-[#05080F] hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Audit
          </button>
          <button
            type="button"
            onClick={onShare}
            disabled={disabled || !activeAuditId}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-lg bg-[#05080F] border border-slate-800 text-slate-200 hover:bg-slate-800/70 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#10B981]" />
            Share with Client
          </button>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-lg bg-[#05080F] border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/70 transition whitespace-nowrap shrink-0"
          >
            <Users className="w-3.5 h-3.5" />
            Clients
          </Link>
        </div>
      </div>

      {hasClients && activeClientId && (
        <p className="mt-3 text-xs text-slate-500">
          Each brokerage&apos;s audits are isolated in encrypted browser storage so client ledgers never mix.
        </p>
      )}
    </section>
  );
}
