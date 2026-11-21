import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildLeakageAuditBriefNote,
  calculateBrokerageLeakage,
  formatCurrencyWhole,
} from './leakage-tool';

test('calculateBrokerageLeakage sums exact component categories into quarterly total', () => {
  const result = calculateBrokerageLeakage({
    monthlyClosedSides: 24,
    averageCommission: 9500,
    agentCount: 32,
  });

  assert.equal(result.monthlyGrossGci, 24 * 9500);
  assert.equal(result.quarterlyGrossGci, 24 * 9500 * 3);
  assert.equal(
    result.quarterlySplitDrift +
      result.quarterlyUncollectedReferrals +
      result.quarterlyWaivedFees,
    result.quarterlyEstimatedLeakage,
  );
  assert.equal(result.annualEstimatedLeakage, result.quarterlyEstimatedLeakage * 4);
  assert.ok(result.quarterlyEstimatedLeakage > 15000);
  assert.ok(result.estimatedFlaggedFilesPerQuarter >= 3);
});

test('calculateBrokerageLeakage increases monotonically when sides, commission, or agent count rise', () => {
  const base = calculateBrokerageLeakage({
    monthlyClosedSides: 20,
    averageCommission: 8500,
    agentCount: 20,
  });
  const moreSides = calculateBrokerageLeakage({
    monthlyClosedSides: 40,
    averageCommission: 8500,
    agentCount: 20,
  });
  const higherGci = calculateBrokerageLeakage({
    monthlyClosedSides: 20,
    averageCommission: 14000,
    agentCount: 20,
  });
  const moreAgents = calculateBrokerageLeakage({
    monthlyClosedSides: 20,
    averageCommission: 8500,
    agentCount: 65,
  });

  assert.ok(moreSides.quarterlyEstimatedLeakage > base.quarterlyEstimatedLeakage);
  assert.ok(higherGci.quarterlyEstimatedLeakage > base.quarterlyEstimatedLeakage);
  assert.ok(moreAgents.quarterlyEstimatedLeakage > base.quarterlyEstimatedLeakage);
});

test('buildLeakageAuditBriefNote includes formatted currency and slider values', () => {
  const inputs = {
    monthlyClosedSides: 30,
    averageCommission: 10000,
    agentCount: 42,
  };
  const estimate = calculateBrokerageLeakage(inputs);
  const note = buildLeakageAuditBriefNote(inputs, estimate);

  assert.ok(note.includes('30 closed sides/mo'));
  assert.ok(note.includes('$10,000'));
  assert.ok(note.includes('42 active agents'));
  assert.ok(note.includes(formatCurrencyWhole(estimate.quarterlyEstimatedLeakage)));
});
