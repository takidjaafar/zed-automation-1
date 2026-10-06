import { Metadata } from 'next';
import CommissionLeakageCalculator from '@/components/CommissionLeakageCalculator';

export const metadata: Metadata = {
  title: 'Commission Leakage Calculator | Zed Automation',
  description:
    'Discover how much money your brokerage might be losing annually due to commission and referral fee errors.',
};

export default function CommissionCalculatorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <CommissionLeakageCalculator />
    </main>
  );
}
