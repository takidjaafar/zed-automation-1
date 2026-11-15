'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, FolderPlus, X } from 'lucide-react';
import { z } from 'zod';

import type { Client } from '@/types/commission-audit';

export interface NewAuditArgs {
  clientId: string;
  name: string;
  periodStart: string;
  periodEnd: string;
}

export interface NewAuditDialogProps {
  open: boolean;
  onClose: () => void;
  clients: Client[];
  defaultClientId: string | null;
  onCreate: (args: NewAuditArgs) => void;
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

const newAuditSchema = z
  .object({
    clientId: z.string().min(1, 'Choose the client this audit belongs to.'),
    name: z
      .string()
      .trim()
      .min(1, 'Give the audit a name so it is recognisable in the audit history.')
      .max(120, 'Audit name must be 120 characters or fewer.'),
    periodStart: z.string().regex(ISO_DAY, 'Choose a valid start date.'),
    periodEnd: z.string().regex(ISO_DAY, 'Choose a valid end date.'),
  })
  .refine((value) => value.periodStart <= value.periodEnd, {
    message: 'The period end must be on or after the period start.',
    path: ['periodEnd'],
  });

type NewAuditValues = z.infer<typeof newAuditSchema>;
type FieldErrors = Partial<Record<keyof NewAuditValues, string>>;

function defaultName(): string {
  return `${format(new Date(), 'MMMM yyyy')} commission audit`;
}

import { format, startOfMonth } from 'date-fns';

/** Creates a new, empty audit and files it under the chosen client. */
export default function NewAuditDialog({
  open,
  onClose,
  clients,
  defaultClientId,
  onCreate,
}: NewAuditDialogProps) {
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState(defaultName);
  const [periodStart, setPeriodStart] = useState(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [periodEnd, setPeriodEnd] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!open) return;
    setClientId(defaultClientId ?? clients[0]?.id ?? '');
    setName(defaultName());
    setPeriodStart(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    setPeriodEnd(format(new Date(), 'yyyy-MM-dd'));
    setErrors({});
  }, [open, defaultClientId, clients]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === clientId) ?? null,
    [clients, clientId],
  );

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = newAuditSchema.safeParse({ clientId, name, periodStart, periodEnd });
    if (!parsed.success) {
      const next: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof NewAuditValues | undefined;
        if (key && !next[key]) next[key] = issue.message;
      });
      setErrors(next);
      return;
    }
    onCreate(parsed.data);
    onClose();
  };

  const fieldClass = (hasError: boolean) =>
    `w-full px-3 py-2 rounded-lg border text-sm outline-none transition bg-[#05080F] text-white placeholder:text-slate-600 focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] ${
      hasError ? 'border-rose-500/70' : 'border-slate-800'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-audit-title"
        className="bg-[#0B1120] rounded-2xl w-full max-w-lg shadow-2xl border border-slate-800/80 my-auto text-slate-100"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#10B981] text-[#05080F] flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 id="new-audit-title" className="text-base font-bold text-white">
                New audit
              </h2>
              <p className="text-xs text-slate-400">
                Filed under the client you choose — stored as its own record.
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
          {clients.length === 0 && (
            <p className="text-[11px] text-rose-300 rounded-lg border border-rose-500/40 bg-rose-950/30 p-3">
              No clients exist yet. Create a client on the Clients page first.
            </p>
          )}

          <div>
            <label
              htmlFor="new-audit-client"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Client <span className="text-rose-400">*</span>
            </label>
            <select
              id="new-audit-client"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              className={fieldClass(Boolean(errors.clientId))}
            >
              <option value="">— Select a client —</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                  {client.company ? ` — ${client.company}` : ''}
                </option>
              ))}
            </select>
            {errors.clientId && <p className="text-[11px] text-rose-400 mt-1">{errors.clientId}</p>}
            {selectedClient && (
              <p className="text-[11px] text-slate-500 mt-1">
                Storage key:{' '}
                <span className="font-mono text-slate-400">
                  audit_{selectedClient.id}_[id]
                </span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="new-audit-name"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              Audit name <span className="text-rose-400">*</span>
            </label>
            <input
              id="new-audit-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Q1 2026 commission audit"
              className={fieldClass(Boolean(errors.name))}
            />
            {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="new-audit-start"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5"
              >
                <CalendarDays className="w-3.5 h-3.5 text-[#10B981]" />
                Period start
              </label>
              <input
                id="new-audit-start"
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
                htmlFor="new-audit-end"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5"
              >
                <CalendarDays className="w-3.5 h-3.5 text-[#10B981]" />
                Period end
              </label>
              <input
                id="new-audit-end"
                type="date"
                value={periodEnd}
                onChange={(event) => setPeriodEnd(event.target.value)}
                className={fieldClass(Boolean(errors.periodEnd))}
              />
              {errors.periodEnd && <p className="text-[11px] text-rose-400 mt-1">{errors.periodEnd}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-800/80 px-6 py-4 bg-[#05080F]/70 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#0B1120] border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={clients.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg bg-[#10B981] text-[#05080F] hover:bg-emerald-400 transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            Create audit
          </button>
        </div>
      </form>
    </div>
  );
}
