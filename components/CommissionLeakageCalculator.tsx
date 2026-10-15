'use client';

import React, { useState } from 'react';
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
  CheckCircle2,
} from 'lucide-react';

interface CommissionLeakageCalculatorProps {
  /** Optional custom CTA link (defaults to your Calendly booking link) */
  ctaUrl?: string;
  className?: string;
}

export default function CommissionLeakageCalculator({
  ctaUrl = 'https://calendly.com/zakariadjaafar12/commission-audit-discovery-call',
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
      {/* Outer Card with Glassmorphism and Ambient Glow */}
      <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-slate-200 via-slate-200/50 to-transparent dark:from-slate-700/80 dark:via-slate-800/40 dark:to-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-black/60 transition-all duration-300">
        <div className="relative rounded-[23px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl overflow-hidden">
          
          {/* Trust-Building Top Header */}
          <div className="px-6 sm:px-8 py-5 bg-gradient-to-r from-slate-50/90 via-slate-50/50 to-white dark:from-slate-800/60 dark:via-slate-900/40 dark:to-slate-900/60 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 dark:from-emerald-500 dark:to-teal-400 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-md shadow-slate-900/10 dark:shadow-emerald-500/25 ring-1 ring-black/5 dark:ring-white/10">
                <span>Z</span>
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  Zed Automation
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Pro
                  </span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                  Financial Audits for Real Estate Brokerages
                </span>
              </div>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/20 dark:border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Audit Tool</span>
            </div>
          </div>

          {/* Title & Introduction */}
          <div className="px-6 sm:px-8 pt-8 pb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Commission Leakage Calculator
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Discover how much money your brokerage might be losing annually due to hidden commission discrepancies, split mistakes, and referral fee errors.
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 pt-2 space-y-6">
            <form onSubmit={handleCalculate} className="space-y-5">
              
              {/* Input 1: Monthly Deals */}
              <div className="group">
                <label
                  htmlFor="monthlyDeals"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400"
                >
                  Number of Monthly Deals
                </label>
                <div className="relative rounded-2xl shadow-sm transition-transform duration-200 group-hover:translate-y-[-1px]">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-emerald-500">
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
                    className="w-full pl-12 pr-4 py-3.5 text-base font-medium rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 focus:bg-white dark:focus:bg-slate-800/90 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Input 2: Average Commission */}
              <div className="group">
                <label
                  htmlFor="averageCommission"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400"
                >
                  Average Commission Value (USD)
                </label>
                <div className="relative rounded-2xl shadow-sm transition-transform duration-200 group-hover:translate-y-[-1px]">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-emerald-500">
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
                    className="w-full pl-12 pr-4 py-3.5 text-base font-medium rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 focus:bg-white dark:focus:bg-slate-800/90 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Validation Alert */}
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Calculate Button */}
              <button
                type="submit"
                className="w-full relative group overflow-hidden inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-emerald-600 dark:via-teal-600 dark:to-emerald-600 shadow-md shadow-slate-900/10 dark:shadow-emerald-950/40 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.99] transition-all duration-200 cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                <Calculator className="w-4 h-4 text-emerald-400 dark:text-emerald-100 transition-transform group-hover:rotate-6" />
                <span className="tracking-wide">Calculate Annual Leakage</span>
              </button>
            </form>

            {/* Result Box (Critical attention-grabbing design) */}
            {hasCalculated && calculatedLeakage !== null && (
              <div className="mt-8 pt-6 border-t border-slate-200/70 dark:border-slate-800 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                
                {/* Visual Highlight Card */}
                <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-rose-50 via-orange-50/60 to-amber-50/30 dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/50 shadow-lg shadow-rose-950/5 overflow-hidden">
                  {/* Subtle decorative glow circle */}
                  <div className="absolute -top-12 -right-12 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold tracking-wide">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                      <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                      <span>Estimated Annual Leakage</span>
                    </div>

                    <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                      3% Benchmark
                    </span>
                  </div>

                  {/* Main Metric Callout */}
                  <div className="mt-4 sm:mt-5">
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Projected Annual Loss
                    </p>
                    <div className="flex items-baseline flex-wrap gap-2">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
                        {formatCurrency(calculatedLeakage)}
                      </span>
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        / year
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      Based on your inputs, your brokerage could be losing approximately{' '}
                      <strong className="text-rose-600 dark:text-rose-400 font-mono font-bold">
                        {formatCurrency(calculatedLeakage)}
                      </strong>{' '}
                      annually due to undetected calculation errors and missing split reconciliation.
                    </p>
                  </div>

                  {/* Secondary Financial Context */}
                  <div className="mt-5 pt-4 border-t border-rose-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span>Estimated Annual Commission Volume:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200 font-mono text-sm">
                      {formatCurrency(calculatedLeakage / 0.03)}
                    </span>
                  </div>
                </div>

                {/* Methodology Note */}
                <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed px-1">
                  Based on industry benchmarks: Over{' '}
                  <a
                    href="#"
                    className="font-medium underline decoration-slate-400 hover:decoration-slate-600 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    74%
                  </a>{' '}
                  of brokerages have commission calculation errors in a 90-day period, with an average overpayment of 3%.
                </p>

                {/* High-Impact CTA Section */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-600 shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 cursor-pointer text-center animate-pulse hover:animate-none"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200 shrink-0" />
                    <span className="tracking-wide">Get a Free 3-Deal Audit</span>
                    <ArrowRight className="w-4 h-4 text-emerald-100 group-hover:translate-x-1 transition-transform duration-200 shrink-0" />
                  </a>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline underline-offset-4 py-2 px-3 transition-colors cursor-pointer shrink-0"
                  >
                    Reset form
                  </button>
                </div>

                {/* "What You Get" Box */}
                <div className="rounded-2xl p-5 bg-gradient-to-b from-gray-50 to-slate-100/70 dark:from-slate-800/50 dark:to-slate-800/20 border border-gray-200 dark:border-slate-700/60 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-3.5 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>What the Free Audit Includes:</span>
                  </h4>
                  <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>A line-by-line review of 3 of your recent deals.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>A report showing exactly where money was lost.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>A clear action plan to prevent future leakage.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Card Footer Note */}
          <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Based on industry estimates of a 3% error rate in commission calculations.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Reassurance below the Card */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
        <span>Your data is secure. We never share your information.</span>
      </div>
    </div>
  );
}
