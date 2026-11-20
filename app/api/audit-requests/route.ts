import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import {
  auditIntakeSchema,
  generateAuditReferenceId,
  type StoredAuditRequest,
} from '@/lib/commission-audit/audit-intake';

export const runtime = 'nodejs';

const DATA_DIR = path.join(process.cwd(), '.data');
const STORAGE_FILE = path.join(DATA_DIR, 'audit-requests.json');

// Process-level fallback store so requests are never dropped even on read-only filesystems.
const memoryFallbackStore: StoredAuditRequest[] = [];

async function readStoredRequests(): Promise<StoredAuditRequest[]> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredAuditRequest[]) : [];
  } catch {
    return [...memoryFallbackStore];
  }
}

async function persistRequest(record: StoredAuditRequest): Promise<'file' | 'memory'> {
  memoryFallbackStore.unshift(record);
  if (memoryFallbackStore.length > 200) {
    memoryFallbackStore.length = 200;
  }

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    let existing: StoredAuditRequest[] = [];
    try {
      const raw = await fs.readFile(STORAGE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        existing = parsed as StoredAuditRequest[];
      }
    } catch {
      existing = [];
    }

    const updated = [record, ...existing].slice(0, 500);
    await fs.writeFile(STORAGE_FILE, JSON.stringify(updated, null, 2), 'utf8');
    return 'file';
  } catch {
    return 'memory';
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = auditIntakeSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? 'Please check all required fields and try again.';
      return NextResponse.json(
        { ok: false, error: firstError },
        { status: 400 },
      );
    }

    const now = new Date();
    const record: StoredAuditRequest = {
      id: crypto.randomUUID(),
      referenceId: generateAuditReferenceId(now),
      submittedAt: now.toISOString(),
      ...parsed.data,
    };

    const storageBackend = await persistRequest(record);

    return NextResponse.json(
      {
        ok: true,
        id: record.id,
        referenceId: record.referenceId,
        submittedAt: record.submittedAt,
        storage: storageBackend,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Unable to parse audit request payload.' },
      { status: 400 },
    );
  }
}

export async function GET() {
  const requests = await readStoredRequests();
  return NextResponse.json({
    ok: true,
    count: requests.length,
    latestReferenceId: requests[0]?.referenceId ?? null,
  });
}
