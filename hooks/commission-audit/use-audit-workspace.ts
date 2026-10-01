'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import * as storage from '@/lib/commission-audit/storage';
import type { AuditRecord, Client, Transaction } from '@/types/commission-audit';

export interface CreateAuditArgs {
  clientId: string;
  name: string;
  periodStart?: string;
  periodEnd?: string;
  /** Transactions to seed the new audit with (defaults to none). */
  transactions?: Transaction[];
}

export interface AuditWorkspace {
  /** False until localStorage has been read on the client. */
  ready: boolean;
  storageUnavailable: boolean;
  clients: Client[];
  activeClient: Client | null;
  audits: AuditRecord[];
  activeAudit: AuditRecord | null;
  transactions: Transaction[];
  /** Replace the active audit's transactions and persist them. */
  setTransactions: (next: Transaction[]) => void;
  selectClient: (clientId: string) => void;
  selectAudit: (auditId: string) => void;
  createClient: (input: storage.ClientInput) => Client | null;
  updateClient: (clientId: string, patch: Partial<storage.ClientInput>) => void;
  deleteClient: (clientId: string) => void;
  createAudit: (args: CreateAuditArgs) => AuditRecord | null;
  deleteAudit: (clientId: string, auditId: string) => void;
  renameAudit: (
    clientId: string,
    auditId: string,
    patch: Partial<Pick<AuditRecord, 'name' | 'periodStart' | 'periodEnd'>>,
  ) => void;
  /** Re-read the client registry (after edits made elsewhere, e.g. /clients). */
  refreshClients: () => void;
  buildShareUrl: (auditId: string, origin?: string) => string;
}

/**
 * The client/audit selection layer for the commission audit page.
 *
 * All persistence is delegated to `lib/commission-audit/storage.ts`; this hook
 * only keeps React state in step with it.
 */
export function useAuditWorkspace(): AuditWorkspace {
  const [ready, setReady] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);
  const [transactions, setTransactionsState] = useState<Transaction[]>([]);

  /* ------------------------------ bootstrap ------------------------------ */

  useEffect(() => {
    const boot = storage.initializeWorkspace();
    setClients(boot.clients);
    setActiveClientId(boot.activeClientId);
    setStorageUnavailable(boot.storageUnavailable);
    setReady(true);
  }, []);

  /* --------------------- load audits for active client ------------------- */

  useEffect(() => {
    if (!ready || !activeClientId) return;

    const list = storage.listAudits(activeClientId);
    setAudits(list);

    let auditId = storage.getActiveAuditId(activeClientId);
    if (!auditId || !list.some((audit) => audit.id === auditId)) {
      auditId = list.length > 0 ? list[0].id : null;
      if (auditId) storage.setActiveAuditId(activeClientId, auditId);
    }

    setActiveAuditId(auditId);
    const audit = auditId ? list.find((item) => item.id === auditId) ?? null : null;
    setTransactionsState(audit ? audit.transactions : []);
  }, [ready, activeClientId]);

  /* ------------------------------ mutations ------------------------------ */

  const setTransactions = useCallback(
    (next: Transaction[]) => {
      setTransactionsState(next);
      if (!activeClientId || !activeAuditId) return;

      const audit = storage.getAudit(activeClientId, activeAuditId);
      if (!audit) return;

      storage.saveAudit({ ...audit, transactions: next });
      setAudits(storage.listAudits(activeClientId));
    },
    [activeClientId, activeAuditId],
  );

  const selectClient = useCallback((clientId: string) => {
    storage.setActiveClientId(clientId);
    setActiveClientId(clientId);
  }, []);

  const selectAudit = useCallback(
    (auditId: string) => {
      if (!activeClientId) return;
      storage.setActiveAuditId(activeClientId, auditId);
      setActiveAuditId(auditId);
      const audit = storage.getAudit(activeClientId, auditId);
      setTransactionsState(audit ? audit.transactions : []);
    },
    [activeClientId],
  );

  const createClient = useCallback((input: storage.ClientInput) => {
    const client = storage.createClient(input);
    setClients(storage.readClients());
    setActiveClientId(client.id);
    return client;
  }, []);

  const updateClient = useCallback((clientId: string, patch: Partial<storage.ClientInput>) => {
    storage.updateClient(clientId, patch);
    setClients(storage.readClients());
  }, []);

  const deleteClient = useCallback(
    (clientId: string) => {
      storage.deleteClient(clientId);
      const remaining = storage.readClients();
      setClients(remaining);
      if (clientId === activeClientId) {
        const next = storage.getActiveClientId() ?? remaining[0]?.id ?? null;
        setActiveClientId(next);
        if (!next) {
          setAudits([]);
          setActiveAuditId(null);
          setTransactionsState([]);
        }
      }
    },
    [activeClientId],
  );

  const createAudit = useCallback(
    (args: CreateAuditArgs) => {
      const audit = storage.createAudit(args);
      storage.setActiveClientId(args.clientId);
      storage.setActiveAuditId(args.clientId, audit.id);

      setClients(storage.readClients());
      if (args.clientId === activeClientId) {
        setAudits(storage.listAudits(args.clientId));
        setActiveAuditId(audit.id);
        setTransactionsState(audit.transactions);
      } else {
        setActiveClientId(args.clientId);
      }
      return audit;
    },
    [activeClientId],
  );

  const deleteAudit = useCallback(
    (clientId: string, auditId: string) => {
      storage.deleteAudit(clientId, auditId);
      if (clientId !== activeClientId) return;

      const list = storage.listAudits(clientId);
      setAudits(list);
      const nextId = storage.getActiveAuditId(clientId) ?? (list[0]?.id ?? null);
      setActiveAuditId(nextId);
      const audit = nextId ? list.find((item) => item.id === nextId) ?? null : null;
      setTransactionsState(audit ? audit.transactions : []);
    },
    [activeClientId],
  );

  const renameAudit = useCallback(
    (
      clientId: string,
      auditId: string,
      patch: Partial<Pick<AuditRecord, 'name' | 'periodStart' | 'periodEnd'>>,
    ) => {
      storage.renameAudit(clientId, auditId, patch);
      if (clientId === activeClientId) setAudits(storage.listAudits(clientId));
    },
    [activeClientId],
  );

  const refreshClients = useCallback(() => {
    setClients(storage.readClients());
  }, []);

  const buildShareUrl = useCallback(
    (auditId: string, origin?: string) => storage.buildShareUrl(auditId, origin),
    [],
  );

  const activeClient = useMemo(
    () => clients.find((client) => client.id === activeClientId) ?? null,
    [clients, activeClientId],
  );

  const activeAudit = useMemo(
    () => audits.find((audit) => audit.id === activeAuditId) ?? null,
    [audits, activeAuditId],
  );

  return {
    ready,
    storageUnavailable,
    clients,
    activeClient,
    audits,
    activeAudit,
    transactions,
    setTransactions,
    selectClient,
    selectAudit,
    createClient,
    updateClient,
    deleteClient,
    createAudit,
    deleteAudit,
    renameAudit,
    refreshClients,
    buildShareUrl,
  };
}
