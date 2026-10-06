import { Metadata } from 'next';
import CommissionLeakageCalculator from '@/components/CommissionLeakageCalculator';

export const metadata: Metadata = {
  title: 'حاسبة تسرب العمولات | Zed Automation',
  description: 'اكتشف كم من المال قد تخسره شركتك سنويًا بسبب أخطاء العمولات ورسوم الإحالة.',
};

export default function CommissionCalculatorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <CommissionLeakageCalculator />
    </main>
  );
}
