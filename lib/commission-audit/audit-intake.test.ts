import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUDIT_DESK_EMAIL,
  auditIntakeSchema,
  buildAuditMailtoUrl,
  formatAuditBrief,
  generateAuditReferenceId,
} from './audit-intake';

const VALID_INPUT = {
  ownerName: 'Marcus Holloway',
  brokerageName: 'Summit Realty Group',
  email: 'marcus@summitrealty.com',
  agentCount: '24',
  dealOne: '412 Oak Ridge Dr — $485,000, 3% side, 70/30 split, paid $11,640',
  dealTwo: '1904 Pinehurst Ave — $620,000, 2.5% side, 25% referral, paid $15,500',
  dealThree: '88 Maplewood Ln — $390,000, 3% side, 80/20 split, paid $9,855',
  notes: '$495 compliance fee per side; $18,000 annual cap',
};

test('auditIntakeSchema accepts a complete 3-deal payload and normalizes agentCount', () => {
  const parsed = auditIntakeSchema.safeParse(VALID_INPUT);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.agentCount, 24);
    assert.equal(parsed.data.brokerageName, 'Summit Realty Group');
  }
});

test('auditIntakeSchema rejects invalid email or missing deal references', () => {
  const badEmail = auditIntakeSchema.safeParse({ ...VALID_INPUT, email: 'not-an-email' });
  assert.equal(badEmail.success, false);

  const missingDeal = auditIntakeSchema.safeParse({ ...VALID_INPUT, dealThree: '   ' });
  assert.equal(missingDeal.success, false);
});

test('formatAuditBrief includes reference ID, broker metadata, all 3 deals, and notes', () => {
  const parsed = auditIntakeSchema.parse(VALID_INPUT);
  const ref = 'ZED-AUD-20261120-AB12';
  const ts = '2026-11-20T15:50:00.000Z';
  const brief = formatAuditBrief(parsed, ref, ts);

  assert.match(brief, /ZED-AUD-20261120-AB12/);
  assert.match(brief, /Marcus Holloway/);
  assert.match(brief, /Summit Realty Group/);
  assert.match(brief, /marcus@summitrealty\.com/);
  assert.match(brief, /Active Agents:\s+24/);
  assert.match(brief, /1\. 412 Oak Ridge Dr/);
  assert.match(brief, /2\. 1904 Pinehurst Ave/);
  assert.match(brief, /3\. 88 Maplewood Ln/);
  assert.match(brief, /\$495 compliance fee/);
  assert.match(brief, /zakaria@zedautomations\.tech/);
});

test('buildAuditMailtoUrl targets zakaria@zedautomations.tech with encoded subject and body', () => {
  const parsed = auditIntakeSchema.parse(VALID_INPUT);
  const ref = 'ZED-AUD-20261120-ZX99';
  const ts = '2026-11-20T15:50:00.000Z';
  const url = buildAuditMailtoUrl(parsed, ref, ts);

  assert.equal(url.startsWith(`mailto:${AUDIT_DESK_EMAIL}?subject=`), true);
  const query = url.slice(`mailto:${AUDIT_DESK_EMAIL}?`.length);
  const params = new URLSearchParams(query);
  assert.match(params.get('subject') ?? '', /ZED-AUD-20261120-ZX99/);
  assert.match(params.get('subject') ?? '', /Summit Realty Group/);
  assert.match(params.get('body') ?? '', /412 Oak Ridge Dr/);
  assert.match(params.get('body') ?? '', /88 Maplewood Ln/);
});

test('generateAuditReferenceId follows ZED-AUD-YYYYMMDD-XXXX format', () => {
  const id = generateAuditReferenceId(new Date('2026-11-20T12:00:00Z'));
  assert.match(id, /^ZED-AUD-20261120-[A-Z0-9]{4}$/);
});
