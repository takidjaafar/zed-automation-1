export const SITE_BASE_URL = 'https://zedautomations.tech';

export const PRIVATE_DISALLOWED_PATHS = [
  '/commission-audit',
  '/commission-calculator',
  '/clients',
  '/dashboard',
  '/api/',
] as const;

export interface AnonymizedAuditSnapshot {
  id: string;
  fileCode: string;
  brokerageProfile: string;
  agentCount: number;
  reviewWindow: string;
  closedSides: number;
  splitDrift: number;
  splitDriftNote: string;
  uncollectedReferrals: number;
  uncollectedReferralsNote: string;
  waivedAdminFees: number;
  waivedAdminFeesNote: string;
  totalRecovered: number;
  ndaNotice: string;
}

export function computeSnapshotTotal(
  snapshot: Pick<
    AnonymizedAuditSnapshot,
    'splitDrift' | 'uncollectedReferrals' | 'waivedAdminFees'
  >,
): number {
  return (
    snapshot.splitDrift +
    snapshot.uncollectedReferrals +
    snapshot.waivedAdminFees
  );
}

export function formatSnapshotUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const ANONYMIZED_AUDIT_SNAPSHOTS: readonly AnonymizedAuditSnapshot[] = [
  {
    id: 'tx-residential-42',
    fileCode: 'Audit File TX-042',
    brokerageProfile: 'Texas Residential Brokerage',
    agentCount: 42,
    reviewWindow: '90-Day Ledger Review',
    closedSides: 126,
    splitDrift: 18450,
    splitDriftNote: '7 files with premature anniversary tier drift',
    uncollectedReferrals: 14200,
    uncollectedReferralsNote: '3 outbound relocation receivables unbilled',
    waivedAdminFees: 5940,
    waivedAdminFeesNote: '12 unapproved $495 compliance waivers',
    totalRecovered: 38590,
    ndaNotice: 'Client identity anonymized under mutual NDA.',
  },
  {
    id: 'fl-coastal-28',
    fileCode: 'Audit File FL-028',
    brokerageProfile: 'Florida Coastal Team',
    agentCount: 28,
    reviewWindow: '90-Day Ledger Review',
    closedSides: 84,
    splitDrift: 11680,
    splitDriftNote: '5 files with cap threshold miscalculation',
    uncollectedReferrals: 9750,
    uncollectedReferralsNote: '2 partner broker referrals omitted on CD',
    waivedAdminFees: 4170,
    waivedAdminFeesNote: '6 unlogged $695 transaction fee waivers',
    totalRecovered: 25600,
    ndaNotice: 'Client identity anonymized under mutual NDA.',
  },
  {
    id: 'az-multi-office-65',
    fileCode: 'Audit File AZ-065',
    brokerageProfile: 'Arizona Multi-Office',
    agentCount: 65,
    reviewWindow: '90-Day Ledger Review',
    closedSides: 214,
    splitDrift: 31200,
    splitDriftNote: '11 files with team override & split variance',
    uncollectedReferrals: 21450,
    uncollectedReferralsNote: '5 corporate referral receivables missed',
    waivedAdminFees: 8910,
    waivedAdminFeesNote: '18 undocumented $495 admin fee waivers',
    totalRecovered: 61560,
    ndaNotice: 'Client identity anonymized under mutual NDA.',
  },
] as const;

export interface DeliverableDossierItem {
  id: 'csv' | 'pdf' | 'loom';
  step: string;
  title: string;
  formatLabel: string;
  description: string;
  previewMeta: readonly { label: string; value: string }[];
}

export const DELIVERABLE_DOSSIER_ITEMS: readonly DeliverableDossierItem[] = [
  {
    id: 'csv',
    step: '01',
    title: 'Line-by-Line Discrepancy CSV',
    formatLabel: 'Spreadsheet Ledger (.csv)',
    description:
      'Every audited deal mapped row-by-row: paid payout vs. contracted split tier, referral fee, and admin charge with exact recoverable dollar deltas.',
    previewMeta: [
      { label: 'Columns', value: 'Deal · Paid · Verified · Delta' },
      { label: 'Import Ready', value: 'Excel & Accounting Ready' },
    ],
  },
  {
    id: 'pdf',
    step: '02',
    title: 'Executive PDF Summary',
    formatLabel: 'Confidential Report (.pdf)',
    description:
      'Board-ready forensic summary categorizing total commission leakage by root cause, agent cap variance, and prioritized clawback steps.',
    previewMeta: [
      { label: 'Sections', value: 'Totals · Root Cause · Policy Gaps' },
      { label: 'Turnaround', value: 'Delivered Within 48 Hours' },
    ],
  },
  {
    id: 'loom',
    step: '03',
    title: 'Private Loom Walkthrough',
    formatLabel: 'Async Video Briefing (5–7 min)',
    description:
      'Password-isolated screen walkthrough stepping through each flagged Closing Disclosure and ledger mismatch so you can review asynchronously with zero meetings.',
    previewMeta: [
      { label: 'Format', value: '100% Written & Async' },
      { label: 'Calls Required', value: 'Zero Sales or Zoom Calls' },
    ],
  },
] as const;

export const CONFIDENTIALITY_GUARANTEE_TEXT =
  'Strict Mutual NDA · No Bank or MLS Logins Required · Source Files Purged 48h Post-Audit';

export interface ExecutiveFaqItem {
  id: string;
  question: string;
  answer: string;
}

export const EXECUTIVE_FAQ_ITEMS: readonly ExecutiveFaqItem[] = [
  {
    id: 'faq-data-needed',
    question: 'What data do you need for the free 3-deal audit?',
    answer:
      'Only 3 closed settlement summaries or Closing Disclosures (CDs) along with the contracted agent split and admin fee terms for those files. We never request bank credentials, QuickBooks access, or MLS logins.',
  },
  {
    id: 'faq-data-protection',
    question: 'How is our brokerage and agent data protected?',
    answer:
      'Every submission is governed by our strict mutual NDA. Your transaction records remain isolated to our forensic audit desk and are permanently deleted within 48 hours of delivering your final report.',
  },
  {
    id: 'faq-zero-calls',
    question: 'Do we need to get on a sales call or Zoom meeting?',
    answer:
      'Never. The entire engagement is 100% asynchronous: submit your 3 closed deals in writing via our intake modal, and receive your Line-by-Line Discrepancy CSV, Executive PDF Summary, and Private Loom Walkthrough by email within 48 hours.',
  },
  {
    id: 'faq-zero-leakage',
    question: 'What happens if you find zero commission leakage?',
    answer:
      'You owe $0. The 3-deal forensic diagnostic is completely free with zero obligation, leaving you with documented written confirmation that your payouts settled cleanly.',
  },
] as const;
