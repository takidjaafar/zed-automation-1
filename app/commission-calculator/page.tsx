import { Metadata } from 'next';
import CommissionCalculatorPortal from '@/components/commission-audit/CommissionCalculatorPortal';

export const metadata: Metadata = {
  title: 'Commission Leakage Calculator | Zed Automation',
  description:
    'Async financial audit tool for US real estate brokerages. Calculate your exact annual commission, split, and referral fee leakage.',
};

export default function CommissionCalculatorPage() {
  return <CommissionCalculatorPortal />;
}
