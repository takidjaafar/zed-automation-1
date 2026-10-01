/**
 * Verification harness for the calculation engine and the PDF report.
 *
 *   npx tsx scripts/verify-pdf-report.ts
 *
 * The audit-formula assertions lock the behaviour that previously lived inline
 * in `app/commission-audit/page.tsx`, so the extraction into
 * `lib/commission-audit/audit.ts` is provably non-breaking.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { calculateAudit, rankByDiscrepancy, summarizeAudit } from '../lib/commission-audit/audit';
import {
  buildExecutiveSummary,
  buildRecommendations,
  buildReportBundle,
  buildReportFileName,
  formatPeriodLabel,
  formatReportDate,
  periodLengthInDays,
  sanitizeFileNamePart,
} from '../lib/commission-audit/report-data';
import { buildAuditReportPdf } from '../lib/commission-audit/report-pdf';
import { INITIAL_SAMPLES } from '../lib/commission-audit/samples';
import type { ReportOptions } from '../lib/commission-audit/report-data';
import type { Transaction } from '../types/commission-audit';

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

const OPTIONS: ReportOptions = {
  clientName: 'Acme Realty Group',
  company: 'Acme Realty Group LLC',
  periodStart: '2025-01-01',
  periodEnd: '2025-03-31',
  preparedBy: 'Dana Whitfield',
  contactEmail: 'audits@acme-realty.example',
  contactPhone: '(415) 555-0134',
  reportDate: new Date('2025-06-30T12:00:00Z'),
};

/**
 * Extract the raw PDF bytes as text so content can be asserted.
 * jsPDF escapes `(`, `)` and `\` inside content streams, so unescape them first.
 */
function pdfText(buffer: ArrayBuffer): string {
  return Buffer.from(buffer)
    .toString('latin1')
    .replace(/\\([()\\])/g, '$1');
}

async function main(): Promise<void> {
  console.log('\nCalculation engine + PDF report — verification\n');

  /* ------------------------------------------------------------------ */
  console.log('calculateAudit — regression against the original inline engine');

  const expected = [
    { id: 'sample-1', total: 27000, listing: 13500, refOut: 0, brokerage: 4050, expected: 9200, discrepancy: 0, status: 'correct' },
    { id: 'sample-2', total: 42500, listing: 25500, refOut: 6375, brokerage: 3825, expected: 14900, discrepancy: 0, status: 'correct' },
    { id: 'sample-3', total: 37200, listing: 18600, refOut: 0, brokerage: 5580, expected: 12520, discrepancy: 1680, status: 'overpaid' },
    { id: 'sample-4', total: 60000, listing: 42000, refOut: 8400, brokerage: 8400, expected: 24700, discrepancy: -3200, status: 'underpaid' },
    { id: 'sample-5', total: 57000, listing: 28500, refOut: 0, brokerage: 8550, expected: 19600, discrepancy: 0, status: 'correct' },
  ];

  await test('reproduces every sample figure exactly', () => {
    expected.forEach((row) => {
      const transaction = INITIAL_SAMPLES.find((t) => t.id === row.id);
      check(transaction, `${row.id} missing from samples`);
      const audit = calculateAudit(transaction as Transaction);
      close(audit.totalCommission, row.total, `${row.id} total commission`);
      close(audit.listingCommission, row.listing, `${row.id} listing commission`);
      close(audit.referralFeeOutAmount, row.refOut, `${row.id} referral out`);
      close(audit.brokerageCut, row.brokerage, `${row.id} brokerage cut`);
      close(audit.expectedAgentPayment, row.expected, `${row.id} expected payment`);
      close(audit.discrepancy, row.discrepancy, `${row.id} discrepancy`);
      eq(audit.status, row.status, `${row.id} status`);
    });
  });

  await test('flags incoming referral income as missing income', () => {
    const withReferral = INITIAL_SAMPLES.find((t) => t.id === 'sample-5') as Transaction;
    const without = INITIAL_SAMPLES.find((t) => t.id === 'sample-1') as Transaction;
    eq(calculateAudit(withReferral).hasMissingReferral, true, 'sample-5 flagged');
    eq(calculateAudit(without).hasMissingReferral, false, 'sample-1 not flagged');
  });

  await test('treats ±$0.50 as rounding noise', () => {
    const base = { ...(INITIAL_SAMPLES[0] as Transaction), actualPaid: 9200.49 };
    eq(calculateAudit(base).status, 'correct', 'below tolerance is accurate');
    eq(calculateAudit({ ...base, actualPaid: 9200.51 }).status, 'overpaid', 'above tolerance is overpaid');
  });

  await test('is safe with missing or non-numeric fields', () => {
    const broken = { ...(INITIAL_SAMPLES[0] as Transaction), salePrice: undefined as unknown as number };
    const audit = calculateAudit(broken);
    eq(audit.totalCommission, 0, 'no NaN leakage');
    check(Number.isFinite(audit.discrepancy), 'discrepancy stays finite');
  });

  /* ------------------------------------------------------------------ */
  console.log('\nsummarizeAudit');

  const summary = summarizeAudit(INITIAL_SAMPLES);

  await test('aggregates the sample population', () => {
    eq(summary.totalTransactions, 5, 'transaction count');
    close(summary.totalOverpaid, 1680, 'total overpaid');
    close(summary.totalUnderpaid, 3200, 'total underpaid');
    close(summary.totalMissingReferral, 3500, 'missing referral income');
    close(summary.netDiscrepancy, -1520, 'net discrepancy');
    eq(summary.overpaidCount, 1, 'overpaid count');
    eq(summary.underpaidCount, 1, 'underpaid count');
    eq(summary.correctCount, 3, 'correct count');
    eq(summary.referralCount, 1, 'referral count');
    eq(summary.discrepancyCount, 2, 'discrepancy count matches the dashboard error badge');
    close(summary.largestOverpay, 1680, 'largest overpay');
    close(summary.largestUnderpay, 3200, 'largest underpay');
  });

  await test('totals sale volume, commission and payouts', () => {
    close(summary.totalSalePrice, 450000 + 850000 + 620000 + 1200000 + 950000, 'sale volume');
    close(
      summary.totalExpectedAgentPayment,
      9200 + 14900 + 12520 + 24700 + 19600,
      'expected payouts',
    );
    close(summary.totalActualPaid, 9200 + 14900 + 14200 + 21500 + 19600, 'actual payouts');
  });

  /* ------------------------------------------------------------------ */
  console.log('\nrankByDiscrepancy');

  await test('ranks the largest absolute variance first and skips accurate deals', () => {
    const ranked = rankByDiscrepancy(INITIAL_SAMPLES, 5);
    eq(ranked.length, 2, 'only discrepant deals are ranked');
    eq(ranked[0].transaction.id, 'sample-4', 'largest first (-3200)');
    eq(ranked[0].audit.status, 'underpaid', 'status carried through');
    eq(ranked[0].rank, 1, 'rank 1');
    eq(ranked[1].transaction.id, 'sample-3', 'second largest (+1680)');
    eq(ranked[1].rank, 2, 'rank 2');
  });

  await test('honours the limit', () => {
    const many = Array.from({ length: 9 }, (_, index) => ({
      ...(INITIAL_SAMPLES[2] as Transaction),
      id: `tx-${index}`,
      salePrice: 620000 + index * 1000,
    }));
    eq(rankByDiscrepancy(many, 5).length, 5, 'limited to five');
  });

  /* ------------------------------------------------------------------ */
  console.log('\nreport-data');

  await test('formats dates and the audited period', () => {
    eq(formatReportDate('2025-01-01'), 'January 1, 2025', 'ISO -> long date');
    eq(formatReportDate('nonsense'), '—', 'invalid date fallback');
    eq(formatPeriodLabel('2025-01-01', '2025-03-31'), 'January 1, 2025 – March 31, 2025', 'period label');
    eq(periodLengthInDays('2025-01-01', '2025-03-31'), 90, 'inclusive day count');
    eq(periodLengthInDays('2025-03-31', '2025-01-01'), 0, 'reversed period is rejected');
  });

  await test('builds the required filename format', () => {
    eq(
      buildReportFileName('Acme Realty Group', new Date('2025-06-30T12:00:00Z')),
      'Commission_Audit_Acme_Realty_Group_2025-06-30.pdf',
      'client name + date',
    );
    eq(buildReportFileName('', new Date('2025-06-30T12:00:00Z')), 'Commission_Audit_Client_2025-06-30.pdf', 'empty client fallback');
    eq(sanitizeFileNamePart('O’Brien & Sons / LLC'), 'O_Brien_Sons_LLC', 'unsafe characters stripped');
  });

  await test('produces 3-5 prioritised recommendations', () => {
    const recommendations = buildRecommendations(INITIAL_SAMPLES, summary);
    check(recommendations.length >= 3 && recommendations.length <= 5, `count in range (got ${recommendations.length})`);
    check(
      recommendations.some((r) => r.title.includes('Recover $1,680.00')),
      'overpayment recovery recommended',
    );
    check(
      recommendations.some((r) => r.title.includes('Settle $3,200.00')),
      'agent shortfall recommended',
    );
    check(
      recommendations.some((r) => /referral income/i.test(r.title)),
      'missing referral income recommended',
    );
    eq(recommendations[0].severity, 'critical', 'critical items come first');
  });

  await test('still recommends 3 items when the books are clean', () => {
    const clean = INITIAL_SAMPLES.filter((t) => t.id === 'sample-1' || t.id === 'sample-2');
    const cleanSummary = summarizeAudit(clean);
    const recommendations = buildRecommendations(clean, cleanSummary);
    eq(recommendations.length, 3, 'topped up from best practices');
    check(recommendations.every((r) => r.severity === 'info'), 'no false alarms');
  });

  await test('writes a plain-English executive summary', () => {
    const paragraph = buildExecutiveSummary(INITIAL_SAMPLES, summary, OPTIONS);
    check(paragraph.includes('Acme Realty Group'), 'names the client');
    check(paragraph.includes('January 1, 2025 – March 31, 2025'), 'names the period');
    check(paragraph.includes('$1,680.00'), 'quantifies overpayment');
    check(paragraph.includes('$3,200.00'), 'quantifies shortfall');
    check(paragraph.includes('$3,500.00'), 'quantifies referral income');
    check(paragraph.length > 400, 'is a full paragraph');
  });

  await test('handles an empty client hand-off', () => {
    const paragraph = buildExecutiveSummary([], summarizeAudit([]), OPTIONS);
    check(/No closed transactions/.test(paragraph), 'explains the empty state');
  });

  await test('assembles the report bundle with contact defaults', () => {
    const bundle = buildReportBundle(INITIAL_SAMPLES, OPTIONS);
    eq(bundle.clientName, 'Acme Realty Group', 'client');
    eq(bundle.company, 'Acme Realty Group LLC', 'company');
    eq(bundle.reportDateLabel, 'June 30, 2025', 'report date label');
    eq(bundle.reportDateIso, '2025-06-30', 'report date iso');
    eq(bundle.preparedBy, 'Dana Whitfield', 'prepared by');
    eq(bundle.periodDays, 90, 'period length');
    eq(bundle.topDiscrepancies.length, 2, 'top discrepancies');
    eq(bundle.recommendations.length >= 3, true, 'recommendations present');

    const fallback = buildReportBundle(INITIAL_SAMPLES, {
      clientName: 'Bare Client',
      periodStart: '2025-01-01',
      periodEnd: '2025-01-31',
    });
    eq(fallback.contactEmail, 'audit@zedautomation.com', 'default contact email');
    eq(fallback.contactPhone, '(555) 010-2030', 'default contact phone');
    eq(fallback.preparedBy, 'Zed Automation Audit Desk', 'default author');
  });

  /* ------------------------------------------------------------------ */
  console.log('\nbuildAuditReportPdf');

  const result = buildAuditReportPdf(INITIAL_SAMPLES, OPTIONS);
  const buffer = result.doc.output('arraybuffer') as ArrayBuffer;
  const text = pdfText(buffer);

  await test('emits a real PDF document', () => {
    check(text.startsWith('%PDF-'), 'has a PDF header');
    check(buffer.byteLength > 20_000, `meaningful payload (got ${buffer.byteLength} bytes)`);
    check(text.includes('%%EOF'), 'is terminated');
  });

  await test('is genuinely multi-page', () => {
    check(result.pageCount >= 5, `at least 5 pages (got ${result.pageCount})`);
  });

  await test('uses the required filename', () => {
    eq(result.fileName, 'Commission_Audit_Acme_Realty_Group_2025-06-30.pdf', 'filename');
  });

  await test('contains every required section', () => {
    const required = [
      'ZED AUTOMATION',
      'Commission Audit Report',
      'Acme Realty Group',
      'January 1, 2025',
      'March 31, 2025',
      'June 30, 2025',
      'CONFIDENTIALITY NOTE',
      'Executive Summary',
      'TRANSACTIONS AUDITED',
      'TOTAL OVERPAID',
      'TOTAL UNDERPAID',
      'MISSING REFERRAL INCOME',
      'NET DISCREPANCY',
      'What this means',
      'Detailed Findings',
      'Expected Agent Payment',
      'Property Address',
      'Top 5 Discrepancies',
      'Recommendations',
      'Generated by Zed Automation',
      'Page 1 of',
      'Dana Whitfield',
      'audits@acme-realty.example',
    ];
    const missing = required.filter((needle) => !text.includes(needle));
    check(missing.length === 0, `missing report text: ${missing.join(' | ')}`);
  });

  await test('prints the KPI money values and the discrepancy detail', () => {
    const required = ['$1,680.00', '$3,200.00', '$3,500.00', '+$1,680.00', '-$3,200.00', 'Overpaid', 'Underpaid', 'Accurate'];
    const missing = required.filter((needle) => !text.includes(needle));
    check(missing.length === 0, `missing figures: ${missing.join(' | ')}`);
  });

  await test('numbers every page in the footer', () => {
    for (let page = 1; page <= result.pageCount; page += 1) {
      check(text.includes(`Page ${page} of ${result.pageCount}`), `footer for page ${page}`);
    }
  });

  await test('renders every transaction in the findings table', () => {
    const missing = INITIAL_SAMPLES.filter((t) => !text.includes(t.address));
    eq(missing.length, 0, `addresses absent from the PDF: ${missing.map((t) => t.id).join(', ')}`);
  });

  await test('writes a readable file to disk', () => {
    const outPath = join(tmpdir(), 'zed-commission-audit-verification.pdf');
    writeFileSync(outPath, Buffer.from(buffer));
    const written = readFileSync(outPath);
    eq(written.subarray(0, 5).toString(), '%PDF-', 'file on disk is a PDF');
    check(written.byteLength === buffer.byteLength, 'no truncation');
    console.log(`      (sample report: ${outPath})`);
  });

  /* ------------------------------------------------------------------ */
  console.log('\nPDF report — edge cases');

  await test('handles an empty audit gracefully', () => {
    const empty = buildAuditReportPdf([], { ...OPTIONS, clientName: 'Empty Books Co' });
    const emptyBuffer = empty.doc.output('arraybuffer') as ArrayBuffer;
    const emptyText = pdfText(emptyBuffer);
    check(empty.pageCount >= 5, 'still produces the full structure');
    check(emptyText.includes('No transactions to report'), 'explains the empty findings');
    check(emptyText.includes('No discrepancies identified'), 'explains the empty top-5');
    check(emptyText.includes('Empty Books Co'), 'cover names the client');
    check(
      empty.fileName === 'Commission_Audit_Empty_Books_Co_2025-06-30.pdf',
      `filename carries the client (got ${empty.fileName})`,
    );
  });

  await test('handles a clean audit without discrepancy blocks', () => {
    const clean = INITIAL_SAMPLES.filter((t) => t.id === 'sample-1' || t.id === 'sample-2');
    const cleanResult = buildAuditReportPdf(clean, { ...OPTIONS, clientName: 'Clean Books Co' });
    const cleanText = pdfText(cleanResult.doc.output('arraybuffer') as ArrayBuffer);
    check(cleanText.includes('No discrepancies identified'), 'shows the all-clear block');
    check(cleanText.includes('$0.00'), 'shows zero totals');
    check(cleanText.includes('Recommendations'), 'still lists recommendations');
  });

  await test('paginates a large findings table', () => {
    const many: Transaction[] = Array.from({ length: 60 }, (_, index) => ({
      ...(INITIAL_SAMPLES[2] as Transaction),
      id: `bulk-${index}`,
      address: `${100 + index} Bulk Test Avenue, Springfield`,
      salePrice: 400000 + index * 5000,
      actualPaid: 12000 + index * 50,
    }));
    const bulk = buildAuditReportPdf(many, { ...OPTIONS, clientName: 'Bulk Brokerage' });
    const bulkText = pdfText(bulk.doc.output('arraybuffer') as ArrayBuffer);
    check(bulk.pageCount >= 8, `60 transactions span multiple pages (got ${bulk.pageCount})`);
    check(bulkText.includes('Bulk Test Avenue'), 'bulk rows rendered');
    check(bulkText.includes('150 Bulk Test Avenue'), 'later rows rendered');
    check(bulkText.includes(`Page 1 of ${bulk.pageCount}`), 'footer count reflects all pages');
  });

  /* ------------------------------------------------------------------ */
  console.log('\nPDF text encoding guards');

  await test('renders the discrepancy label with an ASCII hyphen', () => {
    check(text.includes('Discrepancy (actual - expected)'), 'hyphenated label present');
    check(!text.includes('Discrepancy (actual " expected)'), 'no mangled U+2212 glyph');
  });

  await test('never emits a negative zero money value', () => {
    check(!text.includes('-$0.00'), 'no "-$0.00" artefacts');
  });

  await test('no report source contains characters WinAnsi cannot encode', () => {
    // U+2212 (minus sign) renders as a quote in jsPDF's standard fonts.
    const sources = ['../lib/commission-audit/report-pdf.ts', '../lib/commission-audit/report-data.ts'];
    const offenders: string[] = [];
    sources.forEach((relative) => {
      const content = readFileSync(new URL(relative, import.meta.url), 'utf8');
      content.split('\n').forEach((line, index) => {
        const bad = line.match(/[\u2212\u2044\u2260\u2264\u2265\u00a0]/g);
        if (bad) offenders.push(`${relative}:${index + 1} ${JSON.stringify(bad)}`);
      });
    });
    check(offenders.length === 0, `unencodable characters found: ${offenders.join(' | ')}`);
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
