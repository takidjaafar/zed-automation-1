'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  AlertTriangle,
  TrendingDown,
  ArrowRight,
  DollarSign,
  Briefcase,
  ShieldCheck,
  Sparkles,
  Lock,
} from 'lucide-react';

interface CommissionLeakageCalculatorProps {
  /** Optional custom CTA link (e.g. '/contact' or a Calendly booking URL) */
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

  // Result & validation states
  const [calculatedLeakage, setCalculatedLeakage] = useState<number | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Currency formatter ($12,400)
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
      setError('Please enter a valid monthly deal count greater than 0.');
      return;
    }

    if (isNaN(commission) || commission <= 0) {
      setError('Please enter a valid average commission value greater than 0.');
      return;
    }

    setError(null);

    // Exact formula: monthlyDeals * averageCommission * 12 * 0.03
    // (0.03 represents the 3% estimated error/leakage rate in the industry)
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
    <div className={`w-full max-w-xl mx-auto font-sans antialiased ${className}`}>
      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-950/5 overflow-hidden transition-all duration-300">
        {/* Trust Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-900 dark:bg-emerald-500 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
              Z
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white block">
                Zed Automation
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block -mt-0.5">
                Financial Audits for Real Estate Brokerages
              </span>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200/70 dark:border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            Audit Tool
          </span>
        </div>

        {/* Title Section */}
        <div className="px-6 sm:px-8 pt-7 pb-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Commission Leakage Calculator
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Discover how much money your brokerage might be losing annually due to commission and referral fee errors.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 pt-4 space-y-6">
          <form onSubmit={handleCalculate} className="space-y-5">
            {/* Input 1: Monthly Deals */}
            <div>
              <label
                htmlFor="monthlyDeals"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
              >
                Number of Monthly Deals
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
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
                  placeholder="e.g., 10"
                  className="w-full pl-11 pr-4 py-3 text-base rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                Average Commission Value (USD)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
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
                  placeholder="e.g., 5000"
                  className="w-full pl-11 pr-4 py-3 text-base rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Validation Alert */}
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
              <span>Calculate Annual Leakage</span>
            </button>
          </form>

          {/* Result Box (Appears after calculation) */}
          {hasCalculated && calculatedLeakage !== null && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-rose-50/70 via-amber-50/40 to-slate-50 dark:from-rose-950/30 dark:via-slate-800/60 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/40 shadow-inner">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                    <TrendingDown className="w-4 h-4" />
                    <span>Estimated Annual Leakage</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    3% Industry Rate
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    Based on your inputs, your brokerage could be losing approximately{' '}
                    <span className="font-extrabold text-2xl sm:text-3xl text-rose-600 dark:text-rose-400 inline-block px-1 font-mono">
                      {formatCurrency(calculatedLeakage)}
                    </span>{' '}
                    annually.
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-rose-100 dark:border-rose-900/40 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Estimated Annual Volume:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                    {formatCurrency(calculatedLeakage / 0.03)}
                  </span>
                </div>
              </div>

              {/* Call to Action Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={ctaUrl}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all duration-150"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Get a Free 3-Deal Audit</span>
                  <ArrowRight className="w-4 h-4 text-emerald-100" />
                </Link>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline underline-offset-4 py-2 px-3 transition-colors cursor-pointer"
                >
                  Reset form
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer Note */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/70 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Based on industry estimates of a 3% error rate in commission calculations.
          </p>
        </div>
      </div>

      {/* Privacy Reassurance below the Card */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        <span>Your data is secure. We never share your information.</span>
      </div>
    </div>
  );
}
