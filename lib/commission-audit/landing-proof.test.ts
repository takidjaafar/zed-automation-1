import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ANONYMIZED_AUDIT_SNAPSHOTS,
  CONFIDENTIALITY_GUARANTEE_TEXT,
  DELIVERABLE_DOSSIER_ITEMS,
  EXECUTIVE_FAQ_ITEMS,
  SITE_BASE_URL,
  computeSnapshotTotal,
  formatSnapshotUsd,
} from './landing-proof';
import sitemap from '../../app/sitemap';
import robots from '../../app/robots';

test('anonymized brokerage audit snapshots sum accurately and include NDA notice', () => {
  assert.equal(ANONYMIZED_AUDIT_SNAPSHOTS.length, 3);

  for (const snap of ANONYMIZED_AUDIT_SNAPSHOTS) {
    const computed = computeSnapshotTotal(snap);
    assert.equal(
      computed,
      snap.totalRecovered,
      `Snapshot ${snap.id} total mismatch: expected ${computed}, got ${snap.totalRecovered}`,
    );
    assert.ok(snap.splitDrift > 0);
    assert.ok(snap.uncollectedReferrals > 0);
    assert.ok(snap.waivedAdminFees > 0);
    assert.equal(
      snap.ndaNotice,
      'Client identity anonymized under mutual NDA.',
    );
    assert.match(formatSnapshotUsd(snap.totalRecovered), /^\$\d{1,3}(,\d{3})*$/);
  }
});

test('deliverable dossier contains exact 3 inbox items and confidentiality bar text', () => {
  assert.deepEqual(
    DELIVERABLE_DOSSIER_ITEMS.map((item) => item.title),
    [
      'Line-by-Line Discrepancy CSV',
      'Executive PDF Summary',
      'Private Loom Walkthrough',
    ],
  );
  assert.equal(
    CONFIDENTIALITY_GUARANTEE_TEXT,
    'Strict Mutual NDA · No Bank or MLS Logins Required · Source Files Purged 48h Post-Audit',
  );
});

test('executive FAQ covers all 4 managing broker objections', () => {
  assert.equal(EXECUTIVE_FAQ_ITEMS.length, 4);
  assert.match(EXECUTIVE_FAQ_ITEMS[0].question, /3-deal audit/i);
  assert.match(EXECUTIVE_FAQ_ITEMS[1].question, /data protected/i);
  assert.match(EXECUTIVE_FAQ_ITEMS[2].question, /sales call or Zoom/i);
  assert.match(EXECUTIVE_FAQ_ITEMS[3].question, /zero commission leakage/i);
});

test('sitemap indexes zedautomations.tech and excludes private portal routes', () => {
  const entries = sitemap();
  assert.equal(entries.length, 1);
  assert.equal(entries[0].url, SITE_BASE_URL);

  const urls = entries.map((e) => e.url).join(' ');
  assert.ok(!urls.includes('/commission-audit'));
  assert.ok(!urls.includes('/commission-calculator'));
  assert.ok(!urls.includes('/clients'));
});

test('robots.txt disallows private routes and references sitemap.xml', () => {
  const config = robots();
  const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
  const primary = rules[0];
  const disallowed = Array.isArray(primary.disallow)
    ? primary.disallow
    : primary.disallow
      ? [primary.disallow]
      : [];

  assert.equal(primary.allow, '/');
  assert.ok(disallowed.includes('/commission-audit'));
  assert.ok(disallowed.includes('/commission-calculator'));
  assert.ok(disallowed.includes('/clients'));
  assert.equal(config.sitemap, `${SITE_BASE_URL}/sitemap.xml`);
});
