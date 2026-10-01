/**
 * localStorage persistence for the client portal (Feature 3).
 *
 * Layout
 *   zed_audit_clients_v1              -> Client[]                      (the client registry)
 *   zed_audit_active_client_v1        -> string                        (selected client id)
 *   zed_audit_active_audit_v1_[client]-> string                        (selected audit id per client)
 *   audit_[clientId]_[auditId]        -> AuditRecord                   (one audit per key)
 *   zed_audit_legacy_migrated_v1      -> "1"                           (migration marker)
 *   zed_commission_audit_records_v1   -> Transaction[]                 (pre-Feature-3 data, read-only)
 *
 * Every function is SSR-safe and tolerant of corrupt JSON: a broken record is
 * ignored rather than crashing the page.
 */

import { z } from 'zod';
import { format } from 'date-fns';

import { summarizeAudit } from '@/lib/commission-audit/audit';
import { INITIAL_SAMPLES } from '@/lib/commission-audit/samples';
import type {
  AuditHistoryEntry,
  AuditRecord,
  Client,
  ClientWithHistory,
  Transaction,
  WorkspaceBootstrap,
} from '@/types/commission-audit';

/* -------------------------------------------------------------------------- */
/*  Keys                                                                      */
/* -------------------------------------------------------------------------- */

export const STORAGE_KEYS = {
  clients: 'zed_audit_clients_v1',
  activeClient: 'zed_audit_active_client_v1',
  activeAuditPrefix: 'zed_audit_active_audit_v1_',
  auditPrefix: 'audit_',
  legacyRecords: 'zed_commission_audit_records_v1',
  legacyMigrated: 'zed_audit_legacy_migrated_v1',
} as const;

/** `audit_[clientId]_[auditId]` */
export function auditStorageKey(clientId: string, auditId: string): string {
  return `${STORAGE_KEYS.auditPrefix}${clientId}_${auditId}`;
}

function activeAuditKey(clientId: string): string {
  return `${STORAGE_KEYS.activeAuditPrefix}${clientId}`;
}

export const DEFAULT_CLIENT_NAME = 'Demo Brokerage';
export const DEFAULT_CLIENT_COMPANY = 'Zed Automation Demo';
export const DEFAULT_AUDIT_NAME = 'Sample commission audit';
export const MIGRATED_CLIENT_NAME = 'My Brokerage';
export const MIGRATED_AUDIT_NAME = 'Imported records';

/* -------------------------------------------------------------------------- */
/*  Storage access                                                            */
/* -------------------------------------------------------------------------- */

/**
 * The raw Storage object, or `null` when unavailable.
 * Uses `globalThis` so the Node verification harness can inject a stub.
 */
export function getStorage(): Storage | null {
  try {
    const candidate = (globalThis as { localStorage?: Storage }).localStorage;
    if (!candidate) return null;
    // Probe: Safari private mode throws on writes.
    const probe = '__zed_storage_probe__';
    candidate.setItem(probe, '1');
    candidate.removeItem(probe);
    return candidate;
  } catch {
    return null;
  }
}

export function isStorageAvailable(): boolean {
  return getStorage() !== null;
}

function readJson<T>(key: string): T | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeKey(key: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

/* -------------------------------------------------------------------------- */
/*  Validation of stored payloads                                             */
/* -------------------------------------------------------------------------- */

const transactionSchema = z.object({
  id: z.string(),
  address: z.string(),
  salePrice: z.number(),
  commRate: z.number(),
  listingSplit: z.number(),
  buyerSplit: z.number(),
  brokerSplit: z.number(),
  referralOut: z.number(),
  referralIn: z.number(),
  transactionFee: z.number(),
  actualPaid: z.number(),
});

const clientSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  company: z.string().default(''),
  email: z.string().default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
  notes: z.string().optional(),
});

const auditRecordSchema = z.object({
  id: z.string().min(1),
  clientId: z.string().min(1),
  name: z.string(),
  periodStart: z.string().default(''),
  periodEnd: z.string().default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
  /** Validated separately so one bad row cannot discard an entire audit. */
  transactions: z.unknown().optional(),
});

function coerceTransactions(value: unknown): Transaction[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => transactionSchema.safeParse(item))
    .filter((result): result is z.SafeParseSuccess<Transaction> => result.success)
    .map((result) => result.data);
}

/**
 * Parse a stored audit, keeping every transaction that is still valid.
 * Returns `null` only when the record shape itself is unusable.
 */
function parseAuditRecord(value: unknown): AuditRecord | null {
  const parsed = auditRecordSchema.safeParse(value);
  if (!parsed.success) return null;
  return {
    id: parsed.data.id,
    clientId: parsed.data.clientId,
    name: parsed.data.name,
    periodStart: parsed.data.periodStart,
    periodEnd: parsed.data.periodEnd,
    createdAt: parsed.data.createdAt,
    updatedAt: parsed.data.updatedAt,
    transactions: coerceTransactions(parsed.data.transactions),
  };
}

/* -------------------------------------------------------------------------- */
/*  Ids and clocks                                                            */
/* -------------------------------------------------------------------------- */

export function generateId(prefix: string): string {
  const random =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
  return `${prefix}-${random}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/* -------------------------------------------------------------------------- */
/*  Clients                                                                   */
/* -------------------------------------------------------------------------- */

export function readClients(): Client[] {
  const raw = readJson<unknown>(STORAGE_KEYS.clients);
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => clientSchema.safeParse(item))
    .filter((result): result is z.SafeParseSuccess<Client> => result.success)
    .map((result) => result.data);
}

export function writeClients(clients: Client[]): void {
  writeJson(STORAGE_KEYS.clients, clients);
}

export interface ClientInput {
  name: string;
  company?: string;
  email?: string;
  notes?: string;
}

/** Build (but do not persist) a client record. */
export function createClientObject(input: ClientInput): Client {
  const timestamp = nowIso();
  return {
    id: generateId('cl'),
    name: input.name.trim() || 'Unnamed client',
    company: (input.company ?? '').trim(),
    email: (input.email ?? '').trim(),
    notes: input.notes?.trim() || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createClient(input: ClientInput): Client {
  const client = createClientObject(input);
  writeClients([...readClients(), client]);
  return client;
}

export function getClient(clientId: string): Client | null {
  return readClients().find((client) => client.id === clientId) ?? null;
}

export function updateClient(clientId: string, patch: Partial<ClientInput>): Client | null {
  const clients = readClients();
  const index = clients.findIndex((client) => client.id === clientId);
  if (index === -1) return null;

  const updated: Client = {
    ...clients[index],
    name: patch.name !== undefined ? patch.name.trim() || clients[index].name : clients[index].name,
    company: patch.company !== undefined ? patch.company.trim() : clients[index].company,
    email: patch.email !== undefined ? patch.email.trim() : clients[index].email,
    notes:
      patch.notes !== undefined ? patch.notes.trim() || undefined : clients[index].notes,
    updatedAt: nowIso(),
  };

  clients[index] = updated;
  writeClients(clients);
  return updated;
}

/** Delete a client, every audit it owns, and its selection keys. */
export function deleteClient(clientId: string): void {
  const storage = getStorage();
  const audits = listAudits(clientId);
  audits.forEach((audit) => removeKey(auditStorageKey(clientId, audit.id)));
  removeKey(activeAuditKey(clientId));
  writeClients(readClients().filter((client) => client.id !== clientId));

  if (getActiveClientId() === clientId) {
    const remaining = readClients();
    if (remaining.length > 0) setActiveClientId(remaining[0].id);
    else if (storage) removeKey(STORAGE_KEYS.activeClient);
  }
}

/* -------------------------------------------------------------------------- */
/*  Audits                                                                    */
/* -------------------------------------------------------------------------- */

export interface AuditInput {
  clientId: string;
  name: string;
  periodStart?: string;
  periodEnd?: string;
  transactions?: Transaction[];
}

/** Build (but do not persist) an audit record. */
export function createAuditObject(input: AuditInput): AuditRecord {
  const timestamp = nowIso();
  return {
    id: generateId('au'),
    clientId: input.clientId,
    name: input.name.trim() || 'Untitled audit',
    periodStart: input.periodStart ?? '',
    periodEnd: input.periodEnd ?? '',
    createdAt: timestamp,
    updatedAt: timestamp,
    transactions: input.transactions ?? [],
  };
}

export function createAudit(input: AuditInput): AuditRecord {
  const audit = createAuditObject(input);
  saveAudit(audit);
  return audit;
}

export function saveAudit(audit: AuditRecord): boolean {
  const record: AuditRecord = { ...audit, updatedAt: nowIso() };
  return writeJson(auditStorageKey(audit.clientId, audit.id), record);
}

export function getAudit(clientId: string, auditId: string): AuditRecord | null {
  return parseAuditRecord(readJson<unknown>(auditStorageKey(clientId, auditId)));
}

export function deleteAudit(clientId: string, auditId: string): void {
  removeKey(auditStorageKey(clientId, auditId));
  if (getActiveAuditId(clientId) === auditId) {
    const remaining = listAudits(clientId);
    if (remaining.length > 0) setActiveAuditId(clientId, remaining[0].id);
    else removeKey(activeAuditKey(clientId));
  }
}

export function renameAudit(
  clientId: string,
  auditId: string,
  patch: Partial<Pick<AuditRecord, 'name' | 'periodStart' | 'periodEnd'>>,
): AuditRecord | null {
  const audit = getAudit(clientId, auditId);
  if (!audit) return null;
  const updated: AuditRecord = {
    ...audit,
    name: patch.name !== undefined ? patch.name.trim() || audit.name : audit.name,
    periodStart: patch.periodStart ?? audit.periodStart,
    periodEnd: patch.periodEnd ?? audit.periodEnd,
    updatedAt: nowIso(),
  };
  saveAudit(updated);
  return updated;
}

/** Every audit for a client, newest first. */
export function listAudits(clientId: string): AuditRecord[] {
  const storage = getStorage();
  if (!storage) return [];

  const prefix = `${STORAGE_KEYS.auditPrefix}${clientId}_`;
  const audits: AuditRecord[] = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || !key.startsWith(prefix)) continue;
    const parsed = parseAuditRecord(readJson<unknown>(key));
    if (parsed) audits.push(parsed);
  }

  return audits.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Locate an audit without knowing its client — used by the share link. */
export function findAudit(auditId: string): { client: Client; audit: AuditRecord } | null {
  if (!auditId) return null;
  for (const client of readClients()) {
    const audit = getAudit(client.id, auditId);
    if (audit) return { client, audit };
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Selection                                                                 */
/* -------------------------------------------------------------------------- */

export function getActiveClientId(): string | null {
  return getStorage()?.getItem(STORAGE_KEYS.activeClient) ?? null;
}

export function setActiveClientId(clientId: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS.activeClient, clientId);
  } catch {
    // ignore
  }
}

export function getActiveAuditId(clientId: string): string | null {
  return getStorage()?.getItem(activeAuditKey(clientId)) ?? null;
}

export function setActiveAuditId(clientId: string, auditId: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(activeAuditKey(clientId), auditId);
  } catch {
    // ignore
  }
}

/* -------------------------------------------------------------------------- */
/*  History and analytics                                                     */
/* -------------------------------------------------------------------------- */

export function buildAuditHistoryEntry(audit: AuditRecord): AuditHistoryEntry {
  const summary = summarizeAudit(audit.transactions);
  return {
    id: audit.id,
    clientId: audit.clientId,
    name: audit.name,
    periodStart: audit.periodStart,
    periodEnd: audit.periodEnd,
    createdAt: audit.createdAt,
    updatedAt: audit.updatedAt,
    transactionCount: summary.totalTransactions,
    totalOverpaid: summary.totalOverpaid,
    totalUnderpaid: summary.totalUnderpaid,
    totalMissingReferral: summary.totalMissingReferral,
    netDiscrepancy: summary.netDiscrepancy,
    discrepancyCount: summary.discrepancyCount,
  };
}

export function buildAuditHistory(clientId: string): AuditHistoryEntry[] {
  return listAudits(clientId).map(buildAuditHistoryEntry);
}

/** Every client with their full audit history — powers the /clients page. */
export function listClientsWithHistory(): ClientWithHistory[] {
  return readClients().map((client) => {
    const history = buildAuditHistory(client.id);
    return {
      ...client,
      history,
      transactionCount: history.reduce((total, entry) => total + entry.transactionCount, 0),
    };
  });
}

/* -------------------------------------------------------------------------- */
/*  Bootstrap and migration                                                   */
/* -------------------------------------------------------------------------- */

function readLegacyTransactions(): Transaction[] {
  const raw = readJson<unknown>(STORAGE_KEYS.legacyRecords);
  return coerceTransactions(raw);
}

function defaultPeriod(): { periodStart: string; periodEnd: string } {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return { periodStart: format(start, 'yyyy-MM-dd'), periodEnd: format(today, 'yyyy-MM-dd') };
}

/**
 * Make sure the workspace has at least one client with at least one audit and a
 * valid active selection. Migrates the pre-Feature-3 `zed_commission_audit_records_v1`
 * key into a client + audit on first run so no existing data is lost.
 */
export function initializeWorkspace(): WorkspaceBootstrap {
  if (!isStorageAvailable()) {
    return {
      clients: [],
      activeClientId: null,
      migratedLegacyRecords: false,
      storageUnavailable: true,
    };
  }

  let clients = readClients();
  let migratedLegacyRecords = false;

  if (clients.length === 0) {
    const legacy = readLegacyTransactions();
    const hasLegacy = legacy.length > 0;
    const period = defaultPeriod();

    const client = createClientObject(
      hasLegacy
        ? { name: MIGRATED_CLIENT_NAME, company: '', email: '' }
        : { name: DEFAULT_CLIENT_NAME, company: DEFAULT_CLIENT_COMPANY, email: 'audit@zedautomation.com' },
    );
    writeClients([client]);

    const audit = createAuditObject({
      clientId: client.id,
      name: hasLegacy ? MIGRATED_AUDIT_NAME : DEFAULT_AUDIT_NAME,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      transactions: hasLegacy ? legacy : INITIAL_SAMPLES,
    });
    saveAudit(audit);

    setActiveClientId(client.id);
    setActiveAuditId(client.id, audit.id);
    writeJson(STORAGE_KEYS.legacyMigrated, '1');
    migratedLegacyRecords = hasLegacy;
    clients = [client];
  }

  // Repair a stale or missing active client.
  let activeClientId = getActiveClientId();
  if (!activeClientId || !clients.some((client) => client.id === activeClientId)) {
    activeClientId = clients[0].id;
    setActiveClientId(activeClientId);
  }

  // Every client must own at least one audit so the workspace always has a target.
  if (listAudits(activeClientId).length === 0) {
    const period = defaultPeriod();
    const audit = createAuditObject({
      clientId: activeClientId,
      name: `${format(new Date(), 'MMMM yyyy')} commission audit`,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      transactions: [],
    });
    saveAudit(audit);
    setActiveAuditId(activeClientId, audit.id);
  }

  const activeAuditId = getActiveAuditId(activeClientId);
  if (!activeAuditId || !getAudit(activeClientId, activeAuditId)) {
    const audits = listAudits(activeClientId);
    if (audits.length > 0) setActiveAuditId(activeClientId, audits[0].id);
  }

  return { clients, activeClientId, migratedLegacyRecords, storageUnavailable: false };
}

/* -------------------------------------------------------------------------- */
/*  Sharing                                                                   */
/* -------------------------------------------------------------------------- */

/** Read-only share path for an audit. */
export function buildSharePath(auditId: string): string {
  return `/commission-audit/view/${encodeURIComponent(auditId)}`;
}

/** Absolute read-only share URL (falls back to the path when there is no origin). */
export function buildShareUrl(auditId: string, origin?: string): string {
  const path = buildSharePath(auditId);
  const base = origin ?? (typeof globalThis.location !== 'undefined' ? globalThis.location.origin : '');
  return base ? `${base.replace(/\/$/, '')}${path}` : path;
}

/* -------------------------------------------------------------------------- */
/*  Data health (used by Feature 7)                                           */
/* -------------------------------------------------------------------------- */

export interface StorageFootprint {
  bytes: number;
  keys: number;
  auditKeys: number;
  clientKeys: number;
}

/** Rough size of everything this module stores in localStorage. */
export function getStorageFootprint(): StorageFootprint {
  const storage = getStorage();
  if (!storage) return { bytes: 0, keys: 0, auditKeys: 0, clientKeys: 0 };

  let bytes = 0;
  let keys = 0;
  let auditKeys = 0;
  let clientKeys = 0;

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key) continue;
    const isOurs =
      key.startsWith(STORAGE_KEYS.auditPrefix) ||
      key === STORAGE_KEYS.clients ||
      key.startsWith(STORAGE_KEYS.activeAuditPrefix) ||
      key === STORAGE_KEYS.activeClient ||
      key === STORAGE_KEYS.legacyRecords ||
      key === STORAGE_KEYS.legacyMigrated;
    if (!isOurs) continue;

    keys += 1;
    if (key.startsWith(STORAGE_KEYS.auditPrefix)) auditKeys += 1;
    if (key === STORAGE_KEYS.clients) clientKeys += 1;
    bytes += key.length + (storage.getItem(key)?.length ?? 0);
  }

  // Approximate UTF-16 storage.
  return { bytes: bytes * 2, keys, auditKeys, clientKeys };
}
