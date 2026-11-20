import { z } from 'zod';

export const AUDIT_DESK_EMAIL = 'zakaria@zedautomations.tech';

export const auditIntakeSchema = z.object({
  ownerName: z
    .string()
    .trim()
    .min(1, 'Enter your name, brokerage name, and work email address.')
    .max(120, 'Name must be 120 characters or fewer.'),
  brokerageName: z
    .string()
    .trim()
    .min(1, 'Enter your name, brokerage name, and work email address.')
    .max(160, 'Brokerage name must be 160 characters or fewer.'),
  email: z
    .string()
    .trim()
    .email('Enter a valid work email address for written PDF delivery.')
    .max(180, 'Email must be 180 characters or fewer.'),
  agentCount: z
    .union([z.number(), z.string()])
    .transform((val) => {
      const parsed = typeof val === 'number' ? val : parseInt(val, 10);
      return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 10000) : 1;
    }),
  dealOne: z
    .string()
    .trim()
    .min(1, 'Enter closed deal references for all 3 transactions.')
    .max(500, 'Deal 1 details must be 500 characters or fewer.'),
  dealTwo: z
    .string()
    .trim()
    .min(1, 'Enter closed deal references for all 3 transactions.')
    .max(500, 'Deal 2 details must be 500 characters or fewer.'),
  dealThree: z
    .string()
    .trim()
    .min(1, 'Enter closed deal references for all 3 transactions.')
    .max(500, 'Deal 3 details must be 500 characters or fewer.'),
  notes: z
    .string()
    .trim()
    .max(2000, 'Notes must be 2,000 characters or fewer.')
    .optional()
    .default(''),
});

export type AuditIntakeInput = z.input<typeof auditIntakeSchema>;
export type AuditIntakePayload = z.output<typeof auditIntakeSchema>;

export interface StoredAuditRequest extends AuditIntakePayload {
  id: string;
  referenceId: string;
  submittedAt: string;
}

export function generateAuditReferenceId(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ZED-AUD-${y}${m}${d}-${suffix}`;
}

export function formatAuditBrief(
  payload: AuditIntakePayload,
  referenceId: string,
  submittedAt: string,
): string {
  const lines = [
    'ZED AUTOMATION — 3-DEAL WRITTEN COMMISSION AUDIT BRIEF',
    '======================================================',
    `Reference ID:    ${referenceId}`,
    `Submitted At:    ${submittedAt}`,
    `Managing Broker: ${payload.ownerName}`,
    `Brokerage:       ${payload.brokerageName}`,
    `Work Email:      ${payload.email}`,
    `Active Agents:   ${payload.agentCount}`,
    '',
    'CLOSED TRANSACTIONS FOR FORENSIC AUDIT',
    '------------------------------------------------------',
    `1. ${payload.dealOne}`,
    `2. ${payload.dealTwo}`,
    `3. ${payload.dealThree}`,
  ];

  if (payload.notes && payload.notes.trim().length > 0) {
    lines.push(
      '',
      'CAP RULES, ADMIN FEES & CONTEXT',
      '------------------------------------------------------',
      payload.notes.trim(),
    );
  }

  lines.push(
    '',
    'DELIVERY PREFERENCE',
    '------------------------------------------------------',
    `100% async written delivery (PDF ledger + private Loom) within 48h to ${payload.email}.`,
    `Direct Audit Desk: ${AUDIT_DESK_EMAIL}`,
  );

  return lines.join('\n');
}

export function buildAuditMailtoUrl(
  payload: AuditIntakePayload,
  referenceId: string,
  submittedAt: string,
): string {
  const subject = `[${referenceId}] 3-Deal Commission Audit Request — ${payload.brokerageName}`;
  const brief = formatAuditBrief(payload, referenceId, submittedAt);
  // Keep mailto body safely within cross-client URL length ceilings
  const safeBody = brief.length > 1800 ? `${brief.slice(0, 1780)}\n...[truncated]` : brief;
  return `mailto:${AUDIT_DESK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(safeBody)}`;
}
