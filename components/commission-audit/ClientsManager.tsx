'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Copy,
  ExternalLink,
  FileSpreadsheet,
  FolderOpen,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { z } from 'zod';

import AuditBrand from '@/components/commission-audit/AuditBrand';
import NewAuditDialog from '@/components/commission-audit/NewAuditDialog';
import { ToastProvider, useToast } from '@/components/commission-audit/toast';
import { copyTextToClipboard } from '@/lib/commission-audit/clipboard';
import { formatMoney, formatSignedMoney } from '@/lib/commission-audit/format';
import {
  buildShareUrl,
  createAudit,
  createClient,
  deleteAudit,
  deleteClient,
  listClientsWithHistory,
  setActiveAuditId,
  setActiveClientId,
  updateClient,
} from '@/lib/commission-audit/storage';
import type { ClientWithHistory } from '@/types/commission-audit';
import type { CreateAuditArgs } from '@/hooks/commission-audit/use-audit-workspace';

/* -------------------------------------------------------------------------- */
/*  Validation                                                                */
/* -------------------------------------------------------------------------- */

const clientFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Client name is required — it appears on the cover of every report.')
    .max(120, 'Client name must be 120 characters or fewer.'),
  company: z.string().trim().max(120, 'Company must be 120 characters or fewer.').optional(),
  email: z
    .union([z.literal(''), z.string().trim().email('Enter a valid email address.')])
    .optional(),
  notes: z.string().trim().max(500, 'Notes must be 500 characters or fewer.').optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;
type FieldErrors = Partial<Record<keyof ClientFormValues, string>>;

function formatDay(value: string): string {
  try {
    const parsed = parseISO(value);
    return Number.isNaN(parsed.getTime()) ? '—' : format(parsed, 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

function ClientsManager() {
  const router = useRouter();
  const { push } = useToast();

  const [clients, setClients] = useState<ClientWithHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Create / edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  // New-audit dialog
  const [newAuditClientId, setNewAuditClientId] = useState<string | null>(null);
  const [isNewAuditOpen, setIsNewAuditOpen] = useState(false);

  const refresh = useCallback(() => {
    setClients(listClientsWithHistory());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totals = useMemo(() => {
    const auditCount = clients.reduce((total, client) => total + client.history.length, 0);
    const transactionCount = clients.reduce((total, client) => total + client.transactionCount, 0);
    const netDiscrepancy = clients.reduce(
      (total, client) =>
        total + client.history.reduce((sum, entry) => sum + entry.netDiscrepancy, 0),
      0,
    );
    return { auditCount, transactionCount, netDiscrepancy };
  }, [clients]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setName('');
    setCompany('');
    setEmail('');
    setNotes('');
    setErrors({});
  }, []);

  const startEdit = useCallback((client: ClientWithHistory) => {
    setEditingId(client.id);
    setName(client.name);
    setCompany(client.company);
    setEmail(client.email);
    setNotes(client.notes ?? '');
    setErrors({});
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = clientFormSchema.safeParse({ name, company, email, notes });
    if (!parsed.success) {
      const next: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof ClientFormValues | undefined;
        if (key && !next[key]) next[key] = issue.message;
      });
      setErrors(next);
      return;
    }

    const values = parsed.data;

    if (editingId) {
      updateClient(editingId, values);
      refresh();
      push({ tone: 'success', title: 'Client updated', description: values.name });
      resetForm();
      return;
    }

    const created = createClient(values);
    refresh();
    push({
      tone: 'success',
      title: 'Client created',
      description: `${created.name} is ready for its first audit.`,
    });
    resetForm();
  };

  const handleDeleteClient = (client: ClientWithHistory) => {
    const auditNote =
      client.history.length > 0
        ? ` This also deletes its ${client.history.length} audit${
            client.history.length === 1 ? '' : 's'
          } from this browser.`
        : '';
    if (!confirm(`Delete ${client.name}?${auditNote}`)) return;

    deleteClient(client.id);
    refresh();
    push({ tone: 'info', title: 'Client deleted', description: `${client.name} and its audits were removed.` });
  };

  const handleDeleteAudit = (client: ClientWithHistory, auditId: string, auditName: string) => {
    if (!confirm(`Delete the audit "${auditName}"?`)) return;
    deleteAudit(client.id, auditId);
    refresh();
    push({ tone: 'info', title: 'Audit deleted', description: auditName });
  };

  const handleOpenAudit = (clientId: string, auditId: string) => {
    setActiveClientId(clientId);
    setActiveAuditId(clientId, auditId);
    router.push('/commission-audit');
  };

  const handleCopyShareLink = async (auditId: string, auditName: string) => {
    const url = buildShareUrl(auditId);
    const copied = await copyTextToClipboard(url);
    push({
      tone: copied ? 'success' : 'error',
      title: copied ? 'Read-only link copied' : 'Could not copy automatically',
      description: copied ? `${auditName} — send it to the client.` : url,
    });
  };

  const handleCreateAudit = (args: CreateAuditArgs) => {
    const audit = createAudit({
      clientId: args.clientId,
      name: args.name,
      periodStart: args.periodStart,
      periodEnd: args.periodEnd,
      transactions: [],
    });
    setActiveClientId(args.clientId);
    setActiveAuditId(args.clientId, audit.id);
    refresh();
    const client = clients.find((item) => item.id === args.clientId);
    push({
      tone: 'success',
      title: 'Audit created',
      description: `"${audit.name}" was filed under ${client?.name ?? 'the client'}.`,
    });
  };

  const fieldClass = (hasError: boolean) =>
    `w-full px-3 py-2 rounded-lg border text-sm outline-none transition focus:ring-2 focus:ring-emerald-500 ${
      hasError ? 'border-rose-300 bg-rose-50' : 'border-slate-300 bg-white'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <AuditBrand
            subtitle="Client management & audit history"
            badge={
              <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Clients
              </span>
            }
          />
          <Link
            href="/commission-audit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Open audit workspace
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Clients</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{clients.length}</p>
            <p className="mt-2 text-xs text-slate-400">Brokerages on file</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Audits</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <FolderOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{totals.auditCount}</p>
            <p className="mt-2 text-xs text-slate-400">Stored per client</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Transactions</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{totals.transactionCount}</p>
            <p className="mt-2 text-xs text-slate-400">Across every audit</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net discrepancy</span>
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p
              className={`mt-3 text-2xl font-bold ${
                totals.netDiscrepancy > 0.5
                  ? 'text-rose-600'
                  : totals.netDiscrepancy < -0.5
                    ? 'text-amber-600'
                    : 'text-emerald-600'
              }`}
            >
              {formatSignedMoney(totals.netDiscrepancy)}
            </p>
            <p className="mt-2 text-xs text-slate-400">Positive = brokerage leakage</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client list */}
          <section className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-500" />
                Loading clients…
              </div>
            ) : clients.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h2 className="text-sm font-semibold text-slate-800">No clients yet</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Add your first brokerage to start filing audits against it.
                </p>
              </div>
            ) : (
              clients.map((client) => (
                <article
                  key={client.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
                >
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-sm font-bold text-slate-900 truncate">{client.name}</h2>
                          <p className="text-[11px] text-slate-500 truncate">
                            {client.company || 'No company on file'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                        {client.email && (
                          <span className="inline-flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {client.email}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                          Created {formatDay(client.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                          {client.history.length} audit{client.history.length === 1 ? '' : 's'} ·{' '}
                          {client.transactionCount} transaction
                          {client.transactionCount === 1 ? '' : 's'}
                        </span>
                      </div>
                      {client.notes && (
                        <p className="mt-2 text-[11px] text-slate-500 italic">{client.notes}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setNewAuditClientId(client.id);
                          setIsNewAuditOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                        New audit
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(client)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Pencil className="w-3.5 h-3.5 text-slate-500" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClient(client)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                        title={`Delete ${client.name}`}
                        aria-label={`Delete ${client.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Audit history */}
                  <div className="bg-slate-50/60 px-5 py-4">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Audit history
                    </h3>
                    {client.history.length === 0 ? (
                      <p className="text-[11px] text-slate-500">
                        No audits yet — use “New audit” to start one for {client.name}.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-[11px]">
                          <thead className="text-slate-500 uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="py-1.5 pr-4">Audit</th>
                              <th className="py-1.5 pr-4">Period</th>
                              <th className="py-1.5 pr-4">Created</th>
                              <th className="py-1.5 pr-4 text-right">Deals</th>
                              <th className="py-1.5 pr-4 text-right">Net variance</th>
                              <th className="py-1.5 pr-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {client.history.map((entry) => (
                              <tr key={entry.id}>
                                <td className="py-2 pr-4 font-semibold text-slate-800">{entry.name}</td>
                                <td className="py-2 pr-4 text-slate-600">
                                  {formatDay(entry.periodStart)} – {formatDay(entry.periodEnd)}
                                </td>
                                <td className="py-2 pr-4 text-slate-600">{formatDay(entry.createdAt)}</td>
                                <td className="py-2 pr-4 text-right text-slate-700">
                                  {entry.transactionCount}
                                </td>
                                <td className="py-2 pr-4 text-right">
                                  <span
                                    className={`font-bold ${
                                      entry.netDiscrepancy > 0.5
                                        ? 'text-rose-600'
                                        : entry.netDiscrepancy < -0.5
                                          ? 'text-amber-600'
                                          : 'text-emerald-600'
                                    }`}
                                  >
                                    {formatSignedMoney(entry.netDiscrepancy)}
                                  </span>
                                  {entry.discrepancyCount > 0 && (
                                    <div className="text-[10px] text-slate-400">
                                      {entry.discrepancyCount} flagged ·{' '}
                                      {formatMoney(entry.totalMissingReferral)} referral
                                    </div>
                                  )}
                                </td>
                                <td className="py-2 pr-4">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAudit(client.id, entry.id)}
                                      className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md text-slate-700 hover:bg-slate-200/70 transition"
                                      title="Open in audit workspace"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      Open
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyShareLink(entry.id, entry.name)}
                                      className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md text-cyan-700 hover:bg-cyan-50 transition"
                                      title="Copy read-only client link"
                                    >
                                      <Copy className="w-3 h-3" />
                                      Link
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAudit(client, entry.id, entry.name)}
                                      className="p-1 rounded-md text-rose-500 hover:bg-rose-50 transition"
                                      title="Delete audit"
                                      aria-label={`Delete audit ${entry.name}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </article>
              ))
            )}
          </section>

          {/* Create / edit form */}
          <section className="lg:col-span-1">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4 lg:sticky lg:top-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  {editingId ? <Pencil className="w-4 h-4 text-slate-500" /> : <UserPlus className="w-4 h-4 text-emerald-600" />}
                  {editingId ? 'Edit client' : 'Add client'}
                </h2>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800"
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                )}
              </div>

              <div>
                <label htmlFor="client-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="client-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Acme Realty Group"
                  className={fieldClass(Boolean(errors.name))}
                />
                {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="client-company" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Company / brokerage
                </label>
                <input
                  id="client-company"
                  type="text"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="e.g. Acme Realty Group LLC"
                  className={fieldClass(Boolean(errors.company))}
                />
                {errors.company && <p className="text-[11px] text-rose-600 mt-1">{errors.company}</p>}
              </div>

              <div>
                <label htmlFor="client-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  id="client-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="e.g. finance@acme-realty.example"
                  className={fieldClass(Boolean(errors.email))}
                />
                {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="client-notes" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notes
                </label>
                <textarea
                  id="client-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  placeholder="Engagement details, billing contact, audit cadence…"
                  className={fieldClass(Boolean(errors.notes))}
                />
                {errors.notes && <p className="text-[11px] text-rose-600 mt-1">{errors.notes}</p>}
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm"
              >
                {editingId ? <Pencil className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {editingId ? 'Save changes' : 'Create client'}
              </button>

              <p className="text-[11px] text-slate-500">
                Clients and their audits are stored in this browser only. Use the audit workspace to
                import transactions and generate reports.
              </p>
            </form>
          </section>
        </div>
      </main>

      <NewAuditDialog
        open={isNewAuditOpen}
        onClose={() => setIsNewAuditOpen(false)}
        clients={clients}
        defaultClientId={newAuditClientId ?? clients[0]?.id ?? null}
        onCreate={handleCreateAudit}
      />

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; Zed Automation — Client management for the commission audit suite</p>
          <div className="flex items-center gap-4">
            <Link href="/commission-audit" className="text-emerald-600 hover:underline">
              Audit workspace
            </Link>
            <span>&bull;</span>
            <Link href="/" className="text-emerald-600 hover:underline">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ClientsManagerPage() {
  return (
    <ToastProvider>
      <ClientsManager />
    </ToastProvider>
  );
}
