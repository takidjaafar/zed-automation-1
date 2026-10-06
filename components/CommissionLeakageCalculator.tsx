'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  AlertTriangle,
  TrendingDown,
  ArrowLeft,
  DollarSign,
  Briefcase,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface CommissionLeakageCalculatorProps {
  /** Optional custom CTA link (e.g. '/contact' or a Calendly URL) */
  ctaUrl?: string;
  className?: string;
}

export default function CommissionLeakageCalculator({
  ctaUrl = '/contact',
  className = '',
}: CommissionLeakageCalculatorProps) {
  // Input states
  const [monthlyDeals, setMonthlyDeals] = useState<string>('');
  const [averageCommission, setAverageCommission] = useState<string>('');

  // Result state
  const [calculatedLeakage, setCalculatedLeakage] = useState<number | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Currency formatter (e.g., $12,400)
  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const deals = parseFloat(monthlyDeals);
    const commission = parseFloat(averageCommission);

    if (isNaN(deals) || deals <= 0) {
      setError('يرجى إدخال عدد صفقات شهري صحيح أكبر من صفر.');
      return;
    }

    if (isNaN(commission) || commission <= 0) {
      setError('يرجى إدخال متوسط عمولة صحيح أكبر من صفر.');
      return;
    }

    setError(null);

    // Exact formula: monthlyDeals * averageCommission * 12 * 0.03
    // (0.03 represents the 3% estimated error/leakage rate in the brokerage industry)
    const annualVolume = deals * commission * 12;
    const leakage = annualVolume * 0.03;

    setCalculatedLeakage(leakage);
    setHasCalculated(true);
  };

  const handleReset = () => {
    setMonthlyDeals('');
    setAverageCommission('');
    setCalculatedLeakage(null);
    setHasCalculated(false);
    setError(null);
  };

  return (
    <div
      dir="rtl"
      className={`w-full max-w-xl mx-auto font-sans antialiased ${className}`}
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-950/5 overflow-hidden transition-all duration-300">
        {/* Header Section */}
        <div className="relative px-6 pt-8 pb-6 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-800/40 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800/70">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/50">
                أداة فحص سريعة
              </span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            حاسبة تسرب العمولات
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            اكتشف كم من المال قد تخسره شركتك سنويًا بسبب أخطاء العمولات ورسوم الإحالة.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleCalculate} className="space-y-5">
            {/* Input 1: Monthly Deals */}
            <div>
              <label
                htmlFor="monthlyDeals"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
              >
                عدد الصفقات الشهرية
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Briefcase className="w-5 h-5" />
                </div>
                <input
                  type="number"
                  id="monthlyDeals"
                  name="monthlyDeals"
                  min="1"
                  step="any"
                  value={monthlyDeals}
                  onChange={(e) => {
                    setMonthlyDeals(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="مثال: 10"
                  className="w-full pr-11 pl-4 py-3 text-base rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Input 2: Average Commission */}
            <div>
              <label
                htmlFor="averageCommission"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
              >
                متوسط قيمة العمولة (بالدولار)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <DollarSign className="w-5 h-5" />
                </div>
                <input
                  type="number"
                  id="averageCommission"
                  name="averageCommission"
                  min="1"
                  step="any"
                  value={averageCommission}
                  onChange={(e) => {
                    setAverageCommission(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="مثال: 5000"
                  className="w-full pr-11 pl-4 py-3 text-base rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Validation Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Calculate Button */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-lg shadow-slate-900/10 dark:shadow-emerald-950/30 active:scale-[0.99] transition-all duration-150 cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-emerald-400 dark:text-white" />
              <span>احسب التسرب السنوي</span>
            </button>
          </form>

          {/* Result Box (Appears after calculation) */}
          {hasCalculated && calculatedLeakage !== null && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-rose-50/70 via-amber-50/40 to-slate-50 dark:from-rose-950/30 dark:via-slate-800/60 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/40 shadow-inner">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                    <TrendingDown className="w-4 h-4" />
                    <span>النتيجة التقديرية</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    بمعدل تسرب 3%
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    بناءً على مدخلاتك، قد تفقد شركتك حوالي{' '}
                    <span className="font-extrabold text-2xl sm:text-3xl text-rose-600 dark:text-rose-400 inline-block px-1 dir-ltr font-mono">
                      {formatCurrency(calculatedLeakage)}
                    </span>{' '}
                    سنويًا.
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-rose-100 dark:border-rose-900/40 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>إجمالي حجم العمولات السنوي:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono dir-ltr">
                    {formatCurrency(calculatedLeakage / 0.03)}
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={ctaUrl}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all duration-150"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>احصل على تدقيق مجاني لـ 3 صفقات</span>
                  <ArrowLeft className="w-4 h-4 text-emerald-100" />
                </Link>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline underline-offset-4 py-2 px-3 transition-colors"
                >
                  إعادة تعيين الحقول
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Trust note */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/70 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            الحساب مبني على دراسات تدقيق العمولات العقارية بنسبة خطأ قياسية تبلغ 3% نتيجة الفروقات غير المكتشفة ورسوم الإحالة.
          </p>
        </div>
      </div>
    </div>
  );
}
