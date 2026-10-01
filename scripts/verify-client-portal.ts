/**
 * Verification harness for the client portal (Feature 3).
 *
 *   npx tsx scripts/verify-client-portal.ts
 *
 * Runs the real storage layer against an in-memory localStorage stub, then
 * server-renders the shared table/dashboard components to prove the read-only
 * view really does hide every editing affordance.
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import AuditKpiDashboard from '../components/commission-audit/AuditKpiDashboard';
import TransactionTable from '../components/commission-audit/TransactionTable';
import { INITIAL_SAMPLES } from '../lib/commission-audit/samples';
import {
  DEFAULT_CLIENT_NAME,
  MIGRATED_AUDIT_NAME,
  MIGRATED_CLIENT_NAME,
  STORAGE_KEYS,
  auditStorageKey,
  buildAuditHistory,
  buildSharePath,
  buildShareUrl,
  createAudit,
  createClient,
  deleteAudit,
  deleteClient,
  findAudit,
  getActiveAuditId,
  getActiveClientId,
  getAudit,
  getStorageFootprint,
  initializeWorkspace,
  isStorageAvailable,
  listAudits,
  listClientsWithHistory,
  readClients,
  renameAudit,
  saveAudit,
  setActiveAuditId,
  setActiveClientId,
  updateClient,
} from '../lib/commission-audit/storage';

/* -------------------------------------------------------------------------- */
/*  Harness                                                                   */
/* -------------------------------------------------------------------------- */

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(condition: unknown, message: string): void {
  if (!condition) throw new Error(message || 'assertion failed');
}

function eq<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
  }
}

function close(actual: number, expected: number, message: string, tolerance = 0.005): void {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message} (expected ≈${expected}, got ${actual})`);
  }
}

async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
    passed += 1;
    console.log(`  \u2713 ${name}`);
  } catch (error) {
    failed += 1;
    const message = error instanceof Error ? error.message : String(error);
    failures.push(`${name}: ${message}`);
    console.log(`  \u2717 ${name}\n      ${message}`);
  }
}

/** Minimal in-memory localStorage. */
class FakeStorage {
  private map = new Map<string, string>();

  get length(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }

  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  setItem(key: string, value: string): void {
    this.map.set(key, String(value));
  }
}

function installStorage(seed?: Record<string, string>): FakeStorage {
  const fake = new FakeStorage();
  if (seed) Object.entries(seed).forEach(([key, value]) => fake.setItem(key, value));
  try {
    Object.defineProperty(globalThis, 'localStorage', {
      value: fake,
      configurable: true,
      writable: true,
    });
  } catch {
    (globalThis as unknown as { localStorage: unknown }).localStorage = fake;
  }
  return fake;
}

function transactionCountFor(clientId: string): number {
  return listAudits(clientId).reduce((total, audit) => total + audit.transactions.length, 0);
}

/* -------------------------------------------------------------------------- */
/*  Test suite                                                                */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  console.log('\nClient portal (multi-client) — verification\n');

  /* ------------------------------------------------------------------ */
  console.log('storage availability');

  await test('detects an available localStorage', () => {
    installStorage();
    eq(isStorageAvailable(), true, 'storage detected');
  });

  /* ------------------------------------------------------------------ */
  console.log('\nbootstrap');

  await test('seeds a demo client + sample audit on first run', () => {
    installStorage();
    const boot = initializeWorkspace();

    eq(boot.storageUnavailable, false, 'storage available');
    eq(boot.migratedLegacyRecords, false, 'nothing to migrate');
    eq(boot.clients.length, 1, 'one client created');
    eq(boot.clients[0].name, DEFAULT_CLIENT_NAME, 'demo client name');

    const audits = listAudits(boot.clients[0].id);
    eq(audits.length, 1, 'one audit created');
    eq(audits[0].transactions.length, INITIAL_SAMPLES.length, 'seeded with the sample deals');
    eq(boot.activeClientId, boot.clients[0].id, 'active client set');
    check(getActiveAuditId(boot.clients[0].id) === audits[0].id, 'active audit set');
  });

  await test('migrates pre-Feature-3 records instead of losing them', () => {
    const legacy = [
      {
        id: 'legacy-1',
        address: '99 Legacy Lane',
        salePrice: 500000,
        commRate: 6,
        listingSplit: 50,
        buyerSplit: 50,
        brokerSplit: 30,
        referralOut: 0,
        referralIn: 0,
        transactionFee: 250,
        actualPaid: 12000,
      },
    ];
    installStorage({ [STORAGE_KEYS.legacyRecords]: JSON.stringify(legacy) });

    const boot = initializeWorkspace();
    eq(boot.migratedLegacyRecords, true, 'migration reported');
    eq(boot.clients[0].name, MIGRATED_CLIENT_NAME, 'client named after the migration');

    const audits = listAudits(boot.clients[0].id);
    eq(audits.length, 1, 'one audit');
    eq(audits[0].name, MIGRATED_AUDIT_NAME, 'audit named after the migration');
    eq(audits[0].transactions.length, 1, 'legacy transaction preserved');
    eq(audits[0].transactions[0].address, '99 Legacy Lane', 'legacy payload intact');
  });

  await test('does not re-migrate once clients exist', () => {
    installStorage({
      [STORAGE_KEYS.legacyRecords]: JSON.stringify(INITIAL_SAMPLES),
    });
    const first = initializeWorkspace();
    const second = initializeWorkspace();
    eq(listAudits(second.clients[0].id).length, 1, 'still a single audit');
    eq(first.activeClientId, second.activeClientId, 'stable selection');
  });

  await test('repairs a stale active client pointer', () => {
    installStorage();
    const boot = initializeWorkspace();
    setActiveClientId('cl-does-not-exist');
    const repaired = initializeWorkspace();
    eq(repaired.activeClientId, boot.clients[0].id, 'falls back to a real client');
  });

  await test('creates a default audit for a client that has none', () => {
    const storage = installStorage();
    const boot = initializeWorkspace();
    const empty = createClient({ name: 'Fresh Client' });
    // Point the selection at the new client, then boot again.
    setActiveClientId(empty.id);
    initializeWorkspace();
    eq(listAudits(empty.id).length, 1, 'audit auto-created for the new client');
    check(storage.length >= 3, 'keys were written');
  });

  /* ------------------------------------------------------------------ */
  console.log('\nclients');

  await test('creates clients with the required fields', () => {
    installStorage();
    initializeWorkspace();
    const client = createClient({
      name: 'Acme Realty Group',
      company: 'Acme Realty Group LLC',
      email: 'finance@acme.example',
    });

    eq(client.name, 'Acme Realty Group', 'name');
    eq(client.company, 'Acme Realty Group LLC', 'company');
    eq(client.email, 'finance@acme.example', 'email');
    check(!Number.isNaN(Date.parse(client.createdAt)), 'created date is an ISO timestamp');
    eq(readClients().length, 2, 'registered');
  });

  await test('updates and trims a client', () => {
    installStorage();
    const boot = initializeWorkspace();
    const id = boot.clients[0].id;
    const updated = updateClient(id, { name: '  Renamed Brokerage  ', email: ' x@y.example ' });
    eq(updated?.name, 'Renamed Brokerage', 'name trimmed');
    eq(updated?.email, 'x@y.example', 'email trimmed');
    eq(readClients().find((c) => c.id === id)?.name, 'Renamed Brokerage', 'persisted');
  });

  /* ------------------------------------------------------------------ */
  console.log('\naudits and per-client isolation');

  await test('stores each audit under audit_[clientId]_[auditId]', () => {
    const storage = installStorage();
    initializeWorkspace();
    const client = createClient({ name: 'Key Format Co' });
    const audit = createAudit({
      clientId: client.id,
      name: 'Q1 audit',
      periodStart: '2025-01-01',
      periodEnd: '2025-03-31',
      transactions: INITIAL_SAMPLES,
    });

    const key = `audit_${client.id}_${audit.id}`;
    eq(auditStorageKey(client.id, audit.id), key, 'key helper matches the spec format');
    check(storage.getItem(key) !== null, 'audit stored under the documented key');
    eq(getAudit(client.id, audit.id)?.transactions.length, 5, 'round-trips transactions');
  });

  await test('keeps every client\u2019s audits separate', () => {
    installStorage();
    initializeWorkspace();
    const alpha = createClient({ name: 'Alpha Realty' });
    const beta = createClient({ name: 'Beta Realty' });

    createAudit({ clientId: alpha.id, name: 'Alpha Q1', transactions: INITIAL_SAMPLES });
    createAudit({
      clientId: alpha.id,
      name: 'Alpha Q2',
      transactions: INITIAL_SAMPLES.slice(0, 2),
    });
    createAudit({ clientId: beta.id, name: 'Beta Q1', transactions: [] });

    eq(listAudits(alpha.id).length, 2, 'alpha has two audits');
    eq(listAudits(beta.id).length, 1, 'beta has one audit');
    eq(transactionCountFor(alpha.id), 7, 'alpha transaction total');
    eq(transactionCountFor(beta.id), 0, 'beta transactions do not leak from alpha');

    const betaAudit = listAudits(beta.id)[0];
    check(
      listAudits(alpha.id).every((item) => item.id !== betaAudit.id),
      'no cross-client audit ids',
    );
  });

  await test('persists transaction edits and bumps updatedAt', async () => {
    installStorage();
    initializeWorkspace();
    const client = createClient({ name: 'Persistence Co' });
    const audit = createAudit({ clientId: client.id, name: 'Editable', transactions: [] });

    const before = getAudit(client.id, audit.id)?.updatedAt;
    await new Promise((resolve) => setTimeout(resolve, 5));
    saveAudit({ ...audit, transactions: INITIAL_SAMPLES.slice(0, 3) });

    const reloaded = getAudit(client.id, audit.id);
    eq(reloaded?.transactions.length, 3, 'edits persisted');
    check(reloaded !== null && reloaded.updatedAt !== before, 'updatedAt advanced');
  });

  await test('renames an audit without touching its transactions', () => {
    installStorage();
    initializeWorkspace();
    const client = createClient({ name: 'Rename Co' });
    const audit = createAudit({ clientId: client.id, name: 'Old name', transactions: INITIAL_SAMPLES });
    renameAudit(client.id, audit.id, { name: 'New name', periodEnd: '2025-06-30' });

    const reloaded = getAudit(client.id, audit.id);
    eq(reloaded?.name, 'New name', 'name changed');
    eq(reloaded?.periodEnd, '2025-06-30', 'period changed');
    eq(reloaded?.transactions.length, 5, 'transactions untouched');
  });

  await test('finds an audit by id without knowing the client (share links)', () => {
    installStorage();
    initializeWorkspace();
    const client = createClient({ name: 'Share Co' });
    const audit = createAudit({ clientId: client.id, name: 'Shared', transactions: INITIAL_SAMPLES });

    const found = findAudit(audit.id);
    eq(found?.client.id, client.id, 'owning client resolved');
    eq(found?.audit.name, 'Shared', 'audit resolved');
    eq(findAudit('au-missing'), null, 'unknown id returns null');
  });

  await test('deletes a single audit but keeps the client', () => {
    const storage = installStorage();
    initializeWorkspace();
    const client = createClient({ name: 'Delete Audit Co' });
    const keep = createAudit({ clientId: client.id, name: 'Keep', transactions: [] });
    const drop = createAudit({ clientId: client.id, name: 'Drop', transactions: [] });

    deleteAudit(client.id, drop.id);
    eq(getAudit(client.id, drop.id), null, 'audit removed');
    check(storage.getItem(auditStorageKey(client.id, drop.id)) === null, 'key removed');
    check(getAudit(client.id, keep.id) !== null, 'other audit untouched');
    check(readClients().some((c) => c.id === client.id), 'client kept');
  });

  await test('deletes a client together with all of its audits', () => {
    const storage = installStorage();
    initializeWorkspace();
    const client = createClient({ name: 'Doomed Co' });
    const audit = createAudit({ clientId: client.id, name: 'Doomed audit', transactions: INITIAL_SAMPLES });
    setActiveClientId(client.id);
    setActiveAuditId(client.id, audit.id);

    deleteClient(client.id);

    check(!readClients().some((c) => c.id === client.id), 'client removed');
    check(storage.getItem(auditStorageKey(client.id, audit.id)) === null, 'audit key removed');
    eq(listAudits(client.id).length, 0, 'no audits remain');
    check(getActiveClientId() !== client.id, 'active client moved off the deleted record');
  });

  /* ------------------------------------------------------------------ */
  console.log('\naudit history');

  await test('rolls up audit history per client', () => {
    installStorage();
    initializeWorkspace();
    const client = createClient({ name: 'History Co' });
    createAudit({
      clientId: client.id,
      name: 'History audit',
      periodStart: '2025-01-01',
      periodEnd: '2025-03-31',
      transactions: INITIAL_SAMPLES,
    });

    const history = buildAuditHistory(client.id);
    eq(history.length, 1, 'one entry');
    eq(history[0].transactionCount, 5, 'transaction count');
    close(history[0].netDiscrepancy, -1520, 'net discrepancy');
    close(history[0].totalOverpaid, 1680, 'overpaid');
    close(history[0].totalUnderpaid, 3200, 'underpaid');
    close(history[0].totalMissingReferral, 3500, 'missing referral income');
    eq(history[0].discrepancyCount, 2, 'discrepancy count');
  });

  await test('lists clients with aggregated history', () => {
    installStorage();
    initializeWorkspace();
    const client = createClient({ name: 'Aggregate Co' });
    createAudit({ clientId: client.id, name: 'A1', transactions: INITIAL_SAMPLES });
    createAudit({ clientId: client.id, name: 'A2', transactions: INITIAL_SAMPLES.slice(0, 2) });

    const listed = listClientsWithHistory().find((entry) => entry.id === client.id);
    eq(listed?.history.length, 2, 'two audits in history');
    eq(listed?.transactionCount, 7, 'transactions aggregated across audits');
  });

  /* ------------------------------------------------------------------ */
  console.log('\nshare links');

  await test('builds the documented read-only path', () => {
    eq(buildSharePath('au-123'), '/commission-audit/view/au-123', 'path');
    eq(
      buildShareUrl('au-123', 'https://audit.example.com'),
      'https://audit.example.com/commission-audit/view/au-123',
      'absolute url',
    );
    eq(
      buildShareUrl('au-123', 'https://audit.example.com/'),
      'https://audit.example.com/commission-audit/view/au-123',
      'trailing slash normalised',
    );
    eq(buildSharePath('au/1'), '/commission-audit/view/au%2F1', 'id is url encoded');
  });

  /* ------------------------------------------------------------------ */
  console.log('\nresilience');

  await test('ignores corrupt client JSON instead of throwing', () => {
    installStorage({ [STORAGE_KEYS.clients]: '{not json at all' });
    eq(readClients().length, 0, 'no clients read');
    const boot = initializeWorkspace();
    eq(boot.clients.length, 1, 'workspace recovered with a fresh client');
  });

  await test('ignores a corrupt audit record', () => {
    installStorage({ [STORAGE_KEYS.clients]: JSON.stringify([]) });
    const client = createClient({ name: 'Corrupt Audit Co' });
    installStorage({
      [STORAGE_KEYS.clients]: JSON.stringify([client]),
      [auditStorageKey(client.id, 'au-broken')]: '{"id":"au-broken"',
    });
    eq(getAudit(client.id, 'au-broken'), null, 'bad record rejected');
    eq(listAudits(client.id).length, 0, 'bad record skipped in listings');
  });

  await test('drops malformed transactions inside a stored audit', () => {
    const client = createClient({ name: 'Partial Co' });
    installStorage({
      [STORAGE_KEYS.clients]: JSON.stringify([client]),
      [auditStorageKey(client.id, 'au-partial')]: JSON.stringify({
        id: 'au-partial',
        clientId: client.id,
        name: 'Partial',
        periodStart: '2025-01-01',
        periodEnd: '2025-03-31',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        transactions: [INITIAL_SAMPLES[0], { id: 'bad' }, 'nonsense'],
      }),
    });

    const audit = getAudit(client.id, 'au-partial');
    eq(audit?.transactions.length, 1, 'only the valid transaction survives');
  });

  await test('reports the storage footprint', () => {
    installStorage();
    initializeWorkspace();
    const footprint = getStorageFootprint();
    check(footprint.bytes > 0, 'non-zero size');
    check(footprint.keys >= 3, `counted keys (got ${footprint.keys})`);
    eq(footprint.clientKeys, 1, 'one client registry key');
    check(footprint.auditKeys >= 1, 'at least one audit key');
  });

  /* ------------------------------------------------------------------ */
  console.log('\nread-only view rendering');

  const readOnlyHtml = renderToStaticMarkup(
    React.createElement(TransactionTable, { transactions: INITIAL_SAMPLES, readOnly: true }),
  );
  const editableHtml = renderToStaticMarkup(
    React.createElement(TransactionTable, {
      transactions: INITIAL_SAMPLES,
      onDelete: () => {},
      onInspect: () => {},
    }),
  );

  await test('read-only table hides the Actions column entirely', () => {
    check(!readOnlyHtml.includes('Actions'), 'no "Actions" header');
    check(!readOnlyHtml.includes('Delete record'), 'no delete tooltip/title');
    check(!readOnlyHtml.includes('Inspect Formula Calculation'), 'no inspect button');
    check(!/aria-label="Delete/.test(readOnlyHtml), 'no delete aria-label');
    check(!readOnlyHtml.includes('Trash'), 'no trash icon markup');
  });

  await test('editable table still shows both actions', () => {
    check(editableHtml.includes('Actions'), 'Actions header present');
    check(editableHtml.includes('Delete record'), 'delete button present');
    check(editableHtml.includes('Inspect Formula Calculation'), 'inspect button present');
  });

  await test('read-only table still renders the full dataset', () => {
    INITIAL_SAMPLES.forEach((transaction) => {
      check(readOnlyHtml.includes(transaction.address), `address rendered: ${transaction.id}`);
    });
    check(readOnlyHtml.includes('Showing 5 of 5 transactions'), 'footer count');
    check(readOnlyHtml.includes('OVERPAID'), 'overpaid badge');
    check(readOnlyHtml.includes('UNDERPAID'), 'underpaid badge');
    check(readOnlyHtml.includes('Accurate'), 'accurate badge');
  });

  await test('read-only table offers no editing entry points', () => {
    const forbidden = ['Manual Transaction Entry', 'Import', 'Load Sample Data', 'Clear', 'Delete'];
    const offenders = forbidden.filter((needle) => readOnlyHtml.includes(needle));
    check(offenders.length === 0, `unexpected controls: ${offenders.join(', ')}`);
  });

  await test('KPI dashboard renders every tile with the shared figures', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuditKpiDashboard, { transactions: INITIAL_SAMPLES }),
    );
    const required = [
      'Audited Deals',
      'Broker Overpaid',
      'Broker Underpaid',
      'Missing Referral $',
      'Net Discrepancy',
      '$1,680.00',
      '$3,200.00',
      '$3,500.00',
    ];
    const missing = required.filter((needle) => !html.includes(needle));
    check(missing.length === 0, `missing KPI content: ${missing.join(' | ')}`);
  });

  /* ------------------------------------------------------------------ */
  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failures.length > 0) {
    console.log('Failures:');
    failures.forEach((failure) => console.log(`  - ${failure}`));
    process.exitCode = 1;
  }
}

void main();
