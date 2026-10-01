/**
 * Sample audit records shipped with the module.
 *
 * Kept in the library (rather than inline in the page) so the demo data used by
 * the UI, the PDF report tests and any future seed script are identical.
 *
 * The set intentionally covers every audit outcome:
 *   sample-1  accurate   (expected = paid = $9,200.00)
 *   sample-2  accurate   (expected = paid = $14,900.00)
 *   sample-3  overpaid   (expected $12,520.00, paid $14,200.00 → +$1,680.00)
 *   sample-4  underpaid  (expected $24,700.00, paid $21,500.00 → −$3,200.00)
 *   sample-5  accurate   with $3,500.00 of uncollected incoming referral income
 */

import type { Transaction } from '@/types/commission-audit';

export const INITIAL_SAMPLES: Transaction[] = [
  {
    id: 'sample-1',
    address: '742 Evergreen Terrace, Springfield',
    salePrice: 450000,
    commRate: 6.0,
    listingSplit: 50,
    buyerSplit: 50,
    brokerSplit: 30,
    referralOut: 0,
    referralIn: 0,
    transactionFee: 250,
    actualPaid: 9200,
  },
  {
    id: 'sample-2',
    address: '100 Ocean Drive, Miami Beach, FL',
    salePrice: 850000,
    commRate: 5.0,
    listingSplit: 60,
    buyerSplit: 40,
    brokerSplit: 20,
    referralOut: 25,
    referralIn: 0,
    transactionFee: 400,
    actualPaid: 14900,
  },
  {
    id: 'sample-3',
    address: '42 Wallaby Way, Sydney Park, CA',
    salePrice: 620000,
    commRate: 6.0,
    listingSplit: 50,
    buyerSplit: 50,
    brokerSplit: 30,
    referralOut: 0,
    referralIn: 0,
    transactionFee: 500,
    actualPaid: 14200,
  },
  {
    id: 'sample-4',
    address: '221B Baker Crest, Boston, MA',
    salePrice: 1200000,
    commRate: 5.0,
    listingSplit: 70,
    buyerSplit: 30,
    brokerSplit: 25,
    referralOut: 20,
    referralIn: 0,
    transactionFee: 500,
    actualPaid: 21500,
  },
  {
    id: 'sample-5',
    address: '350 5th Avenue, Suite 12B, New York, NY',
    salePrice: 950000,
    commRate: 6.0,
    listingSplit: 50,
    buyerSplit: 50,
    brokerSplit: 30,
    referralOut: 0,
    referralIn: 3500,
    transactionFee: 350,
    actualPaid: 19600,
  },
];
