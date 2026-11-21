export interface LeakageAuditInputs {
  monthlyClosedSides: number;
  averageCommission: number;
  agentCount: number;
}

export interface LeakageAuditEstimate {
  monthlyGrossGci: number;
  quarterlyGrossGci: number;
  effectiveDriftRate: number;
  quarterlySplitDrift: number;
  quarterlyUncollectedReferrals: number;
  quarterlyWaivedFees: number;
  quarterlyEstimatedLeakage: number;
  annualEstimatedLeakage: number;
  estimatedFlaggedFilesPerQuarter: number;
}

/**
 * Pure deterministic calculation engine for the Brokerage Commission Leakage
 * Audit Tool. Models quarterly and annual brokerage commission leakage across
 * split/cap drift, uncollected outbound referrals, and waived admin fees based
 * on monthly closing volume, average GCI per side, and roster complexity.
 */
export function calculateBrokerageLeakage(
  raw: LeakageAuditInputs,
): LeakageAuditEstimate {
  const monthlyClosedSides = Math.max(1, Math.round(raw.monthlyClosedSides));
  const averageCommission = Math.max(1000, Math.round(raw.averageCommission));
  const agentCount = Math.max(1, Math.round(raw.agentCount));

  const monthlyGrossGci = monthlyClosedSides * averageCommission;
  const quarterlyGrossGci = monthlyGrossGci * 3;

  // Larger agent rosters introduce more split tiers, anniversary resets, and override rules
  const complexityLift = Math.min(0.014, Math.max(0, (agentCount - 10) * 0.00014));
  const splitDriftRate = 0.0185 + complexityLift;
  const referralLeakageRate = 0.0115 + complexityLift * 0.45;

  const quarterlySplitDrift = Math.round(quarterlyGrossGci * splitDriftRate);
  const quarterlyUncollectedReferrals = Math.round(
    quarterlyGrossGci * referralLeakageRate,
  );

  // Typical unlogged compliance/admin waivers (~11% of quarterly sides at $495 average)
  const quarterlySides = monthlyClosedSides * 3;
  const waivedSides = Math.max(1, Math.round(quarterlySides * 0.11));
  const quarterlyWaivedFees = waivedSides * 495;

  const quarterlyEstimatedLeakage =
    quarterlySplitDrift + quarterlyUncollectedReferrals + quarterlyWaivedFees;
  const annualEstimatedLeakage = quarterlyEstimatedLeakage * 4;
  const effectiveDriftRate = quarterlyEstimatedLeakage / quarterlyGrossGci;
  const estimatedFlaggedFilesPerQuarter = Math.max(
    3,
    Math.round(quarterlySides * (0.14 + complexityLift * 3)),
  );

  return {
    monthlyGrossGci,
    quarterlyGrossGci,
    effectiveDriftRate,
    quarterlySplitDrift,
    quarterlyUncollectedReferrals,
    quarterlyWaivedFees,
    quarterlyEstimatedLeakage,
    annualEstimatedLeakage,
    estimatedFlaggedFilesPerQuarter,
  };
}

export function formatCurrencyWhole(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function buildLeakageAuditBriefNote(
  inputs: LeakageAuditInputs,
  estimate: LeakageAuditEstimate,
): string {
  return `Audit Tool Baseline: ${inputs.monthlyClosedSides} closed sides/mo · ${formatCurrencyWhole(inputs.averageCommission)} avg GCI · ${inputs.agentCount} active agents. Est. quarterly leakage ${formatCurrencyWhole(estimate.quarterlyEstimatedLeakage)} (annualized ${formatCurrencyWhole(estimate.annualEstimatedLeakage)}).`;
}
