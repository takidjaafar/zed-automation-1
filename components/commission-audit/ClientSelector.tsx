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
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        {/* Client */}
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="client-selector"
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
          >
            <Building2 className="w-3.5 h-3.5" />
            Client
          </label>
          <select
            id="client-selector"
            value={activeClientId ?? ''}
            disabled={disabled || !hasClients}
            onChange={(event) => onSelectClient(event.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
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
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Audit
          </label>
          <select
            id="audit-selector"
            value={activeAuditId ?? ''}
            disabled={disabled || !hasAudits}
            onChange={(event) => onSelectAudit(event.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
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
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onNewAudit}
            disabled={disabled || !hasClients}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            New Audit
          </button>
          <button
            type="button"
            onClick={onShare}
            disabled={disabled || !activeAuditId}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-600" />
            Share with Client
          </button>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <Users className="w-3.5 h-3.5" />
            Clients
          </Link>
        </div>
      </div>

      {hasClients && activeClientId && (
        <p className="mt-3 text-[11px] text-slate-500">
          Each client&apos;s audits are stored separately in this browser, so switching clients
          never mixes their commission records.
        </p>
      )}
    </section>
  );
}
