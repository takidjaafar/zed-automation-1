'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  DollarSign,
  Lock,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';

interface AuditCalculationResult {
  monthlyDeals: number;
  avgCommission: number;
  numAgents: number;
  disputesPerMonth: number;
  avgCorrectionAmount: number;
  referralFees: boolean;
  monthlyLeakFromDisputes: number;
  monthlyLeakFromReferrals: number;
  monthlyLeakFromInvisible: number;
  totalMonthlyLeak: number;
  annualLeak: number;
  perAgentMonthlyLoss: number;
  adminSalaryMonths: number;
  annualProfitSharePct: number;
  annualGci: number;
}

const ADMIN_MONTHLY_SALARY_USD = 4000;
const EST_PROFIT_MARGIN_ON_GCI = 0.1;

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
}

export default function CommissionLeakageCalculator() {
  const [monthlyDeals, setMonthlyDeals] = useState<number>(20);
  const [avgCommissionInput, setAvgCommissionInput] = useState<string>('8500');
  const [numAgents, setNumAgents] = useState<number>(15);
  const [disputesPerMonth, setDisputesPerMonth] = useState<number>(2);
  const [avgCorrectionInput, setAvgCorrectionInput] = useState<string>('750');
  const [referralFees, setReferralFees] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditCalculationResult | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const avgCommission = parseFloat(avgCommissionInput);
    const avgCorrectionAmount =
      disputesPerMonth > 0 ? parseFloat(avgCorrectionInput) : 0;

    if (isNaN(avgCommission) || avgCommission <= 0) {
      setError('Enter an average commission per deal greater than $0.');
      return;
    }

    if (
      disputesPerMonth > 0 &&
      (isNaN(avgCorrectionAmount) || avgCorrectionAmount < 0)
    ) {
      setError('Enter a valid average correction amount in USD.');
      return;
    }

    setError(null);

    const monthlyLeakFromDisputes = disputesPerMonth * avgCorrectionAmount;
    const monthlyLeakFromReferrals = referralFees
      ? monthlyDeals * avgCommission * 0.015
      : 0;
    const monthlyLeakFromInvisible = monthlyDeals * avgCommission * 0.01;

    const totalMonthlyLeak =
      monthlyLeakFromDisputes +
      monthlyLeakFromReferrals +
      monthlyLeakFromInvisible;

    const annualLeak = totalMonthlyLeak * 12;
    const perAgentMonthlyLoss = totalMonthlyLeak / numAgents;
    const adminSalaryMonths = annualLeak / ADMIN_MONTHLY_SALARY_USD;

    const annualGci = monthlyDeals * avgCommission * 12;
    const estimatedAnnualProfit = annualGci * EST_PROFIT_MARGIN_ON_GCI;
    const annualProfitSharePct =
      estimatedAnnualProfit > 0
        ? (annualLeak / estimatedAnnualProfit) * 100
        : 0;

    setResult({
      monthlyDeals,
      avgCommission,
      numAgents,
      disputesPerMonth,
      avgCorrectionAmount,
      referralFees,
      monthlyLeakFromDisputes,
      monthlyLeakFromReferrals,
      monthlyLeakFromInvisible,
      totalMonthlyLeak,
      annualLeak,
      perAgentMonthlyLoss,
      adminSalaryMonths,
      annualProfitSharePct,
      annualGci,
    });
  };

  const handleReset = () => {
    setMonthlyDeals(20);
    setAvgCommissionInput('8500');
    setNumAgents(15);
    setDisputesPerMonth(2);
    setAvgCorrectionInput('750');
    setReferralFees(true);
    setError(null);
    setResult(null);
  };

  const clampedDealsChange = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) return;
    setMonthlyDeals(Math.min(100, Math.max(5, parsed)));
  };

  const clampedAgentsChange = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) return;
    setNumAgents(Math.min(100, Math.max(5, parsed)));
  };

  const clampedDisputesChange = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) return;
    setDisputesPerMonth(Math.min(10, Math.max(0, parsed)));
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Main Audit Calculator Card */}
      <div className="rounded-2xl bg-[#0B1210]/90 backdrop-blur-xl text-slate-100 shadow-[0_12px_45px_rgba(0,0,0,0.45)] border border-emerald-400/20 overflow-hidden">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-7 pb-6 border-b border-emerald-400/15 bg-[#040807]/50">
          <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-300/90">
            Zed Automation · Async GCI Leakage Model · Based on your numbers
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-white">
            Brokerage Commission Leakage Audit
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Enter your brokerage&apos;s actual deal volume, agent headcount, and
            monthly payout adjustments to quantify recoverable commission leakage.
          </p>
        </div>

        {/* Inputs Form */}
        <form onSubmit={handleCalculate} className="p-6 sm:p-8 space-y-7">
          {/* 1. Number of Monthly Closed Deals */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label
                htmlFor="monthly-deals-input"
                className="text-sm font-semibold text-slate-200"
              >
                Number of Monthly Closed Deals
              </Label>
              <div className="flex items-center gap-2 shrink-0">
                <Input
                  id="monthly-deals-input"
                  type="number"
                  min={5}
                  max={100}
                  value={monthlyDeals}
                  onChange={(e) => clampedDealsChange(e.target.value)}
                  className="w-20 h-9 text-right font-mono tabular-nums font-semibold bg-[#040807]/90 border-emerald-400/20 text-white focus-visible:ring-emerald-400/40"
                />
                <span className="text-xs text-slate-400 font-medium">
                  deals
                </span>
              </div>
            </div>
            <Slider
              aria-label="Number of Monthly Closed Deals"
              min={5}
              max={100}
              step={1}
              value={[monthlyDeals]}
              onValueChange={(val) => setMonthlyDeals(val[0])}
              className="py-1"
            />
            <div className="flex justify-between text-xs text-slate-500 font-mono tabular-nums">
              <span>5</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          {/* 2. Average Commission per Deal in USD */}
          <div className="space-y-2">
            <Label
              htmlFor="avg-commission-input"
              className="text-sm font-semibold text-slate-200"
            >
              Average Commission per Deal (USD)
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <DollarSign className="h-4 w-4" />
              </div>
              <Input
                id="avg-commission-input"
                type="number"
                min={100}
                step="any"
                value={avgCommissionInput}
                onChange={(e) => {
                  setAvgCommissionInput(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="8500"
                className="pl-9 font-mono tabular-nums text-base font-semibold bg-[#040807]/90 border-emerald-400/20 text-white focus-visible:ring-emerald-400/40"
                required
              />
            </div>
          </div>

          {/* 3. Number of Agents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label
                htmlFor="num-agents-input"
                className="text-sm font-semibold text-slate-200"
              >
                Number of Agents
              </Label>
              <div className="flex items-center gap-2 shrink-0">
                <Input
                  id="num-agents-input"
                  type="number"
                  min={5}
                  max={100}
                  value={numAgents}
                  onChange={(e) => clampedAgentsChange(e.target.value)}
                  className="w-20 h-9 text-right font-mono tabular-nums font-semibold bg-[#040807]/90 border-emerald-400/20 text-white focus-visible:ring-emerald-400/40"
                />
                <span className="text-xs text-slate-400 font-medium">
                  agents
                </span>
              </div>
            </div>
            <Slider
              aria-label="Number of Agents"
              min={5}
              max={100}
              step={1}
              value={[numAgents]}
              onValueChange={(val) => setNumAgents(val[0])}
              className="py-1"
            />
            <div className="flex justify-between text-xs text-slate-500 font-mono tabular-nums">
              <span>5</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          {/* 4. Commission corrections/disputes per month */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Label
                  htmlFor="disputes-input"
                  className="text-sm font-semibold text-slate-200 leading-snug block"
                >
                  How many commission corrections/disputes do you have per
                  month?
                </Label>
                <p className="mt-1 text-xs text-slate-400">
                  Split errors, miscalculated referral fees, etc.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Input
                  id="disputes-input"
                  type="number"
                  min={0}
                  max={10}
                  value={disputesPerMonth}
                  onChange={(e) => clampedDisputesChange(e.target.value)}
                  className="w-20 h-9 text-right font-mono tabular-nums font-semibold bg-[#040807]/90 border-emerald-400/20 text-white focus-visible:ring-emerald-400/40"
                />
                <span className="text-xs text-slate-400 font-medium">/ mo</span>
              </div>
            </div>
            <Slider
              aria-label="Monthly commission corrections or disputes"
              min={0}
              max={10}
              step={1}
              value={[disputesPerMonth]}
              onValueChange={(val) => setDisputesPerMonth(val[0])}
              className="py-1"
            />
            <div className="flex justify-between text-xs text-slate-500 font-mono tabular-nums">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          {/* 5. Average amount per correction in USD */}
          {disputesPerMonth > 0 && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Label
                htmlFor="avg-correction-input"
                className="text-sm font-semibold text-slate-200"
              >
                Average amount per correction (USD)
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <DollarSign className="h-4 w-4" />
                </div>
                <Input
                  id="avg-correction-input"
                  type="number"
                  min={0}
                  step="any"
                  value={avgCorrectionInput}
                  onChange={(e) => {
                    setAvgCorrectionInput(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="750"
                  className="pl-9 font-mono tabular-nums text-base font-semibold bg-[#040807]/90 border-emerald-400/20 text-white focus-visible:ring-emerald-400/40"
                  required
                />
              </div>
            </div>
          )}

          {/* 6. Do you pay referral fees? */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <span className="text-sm font-semibold text-slate-200 block">
                Do you pay referral fees?
              </span>
              <span className="text-xs text-slate-400">
                Broker-to-broker, relocation, or third-party portal referrals
              </span>
            </div>

            <div
              role="group"
              aria-label="Do you pay referral fees?"
              className="inline-flex rounded-lg bg-[#040807]/90 p-1 border border-emerald-400/20 self-start sm:self-auto shrink-0"
            >
              <button
                type="button"
                aria-pressed={referralFees === true}
                onClick={() => setReferralFees(true)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  referralFees === true
                    ? 'bg-[#10B981] text-[#040807] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                aria-pressed={referralFees === false}
                onClick={() => setReferralFees(false)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  referralFees === false
                    ? 'bg-[#10B981] text-[#040807] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-300 font-medium">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 h-12 px-5 rounded-xl bg-[#10B981] hover:bg-emerald-400 text-[#040807] font-bold text-base shadow-[0_0_24px_rgba(16,185,129,0.28)] transition-colors cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Calculator className="h-4 w-4 shrink-0" />
              <span>Calculate Annual Leakage</span>
            </button>
            {result && (
              <button
                type="button"
                onClick={handleReset}
                className="h-12 px-4 rounded-xl bg-[#040807]/90 border border-emerald-400/20 text-slate-300 hover:bg-emerald-400/10 hover:text-white font-semibold text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* RESULT CARD + CTA SECTION */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Leakage Result Card */}
          <div className="rounded-2xl bg-[#0B1210]/95 backdrop-blur-xl text-white border border-rose-500/35 shadow-[0_12px_45px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-rose-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>
                    Based on your numbers · {result.monthlyDeals} deals/mo ·{' '}
                    {result.numAgents} agents
                  </span>
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  Estimated brokerage GCI leakage:{' '}
                  <span className="block mt-2 text-4xl sm:text-5xl font-extrabold text-rose-400 font-mono tabular-nums tracking-tight">
                    {formatCurrency(result.annualLeak)}{' '}
                    <span className="text-2xl sm:text-3xl font-bold text-rose-300/80">
                      per year
                    </span>
                  </span>
                </h2>
              </div>

              {/* 3-Column Sub-Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-emerald-400/15">
                <div className="rounded-xl bg-[#040807]/85 border border-emerald-400/15 p-4">
                  <div className="text-2xl font-bold font-mono tabular-nums text-white">
                    {formatCurrency(result.totalMonthlyLeak)}
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-400">
                    / month lost
                  </div>
                </div>

                <div className="rounded-xl bg-[#040807]/85 border border-emerald-400/15 p-4">
                  <div className="text-2xl font-bold font-mono tabular-nums text-white">
                    {formatCurrency(result.perAgentMonthlyLoss)}
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-400">
                    per agent / month
                  </div>
                </div>

                <div className="rounded-xl bg-[#040807]/85 border border-emerald-400/15 p-4">
                  <div className="text-2xl font-bold font-mono tabular-nums text-white">
                    {result.adminSalaryMonths.toFixed(1)} months
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-400">
                    Equivalent admin salary
                  </div>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="pt-5 border-t border-emerald-400/15 space-y-3">
                <h3 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                  Annual Leakage Breakdown
                </h3>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-center justify-between gap-4">
                    <span className="text-slate-300">From split corrections:</span>
                    <span className="font-mono tabular-nums font-bold text-white">
                      {formatCurrency(result.monthlyLeakFromDisputes * 12)}
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        ({formatCurrency(result.monthlyLeakFromDisputes)}/mo)
                      </span>
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-4">
                    <span className="text-slate-300">From referral errors:</span>
                    <span className="font-mono tabular-nums font-bold text-white">
                      {formatCurrency(result.monthlyLeakFromReferrals * 12)}
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        ({formatCurrency(result.monthlyLeakFromReferrals)}/mo)
                      </span>
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-4">
                    <span className="text-slate-300">
                      From invisible 1% errors:
                    </span>
                    <span className="font-mono tabular-nums font-bold text-white">
                      {formatCurrency(result.monthlyLeakFromInvisible * 12)}
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        ({formatCurrency(result.monthlyLeakFromInvisible)}/mo)
                      </span>
                    </span>
                  </li>
                </ul>
              </div>

              {/* Progress Bar: % of annual profit */}
              <div className="pt-5 border-t border-emerald-400/15 space-y-2.5">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                  <span className="text-slate-200">
                    This represents{' '}
                    <span className="text-rose-400 font-mono tabular-nums font-bold">
                      {result.annualProfitSharePct.toFixed(1)}%
                    </span>{' '}
                    of annual net profit
                  </span>
                  <span className="text-xs font-mono tabular-nums text-slate-400 shrink-0">
                    {formatCurrency(result.annualGci)}/yr GCI
                  </span>
                </div>
                <Progress
                  value={Math.min(100, Math.round(result.annualProfitSharePct))}
                  className="h-3 bg-[#040807] border border-emerald-400/15 [&>div]:bg-rose-500"
                />
                <p className="text-xs text-slate-400">
                  Estimated against a standard 10% brokerage net profit margin on
                  your {formatCurrency(result.annualGci)} annual gross
                  commission volume.
                </p>
              </div>
            </div>
          </div>

          {/* Async Written CTA Card */}
          <div className="rounded-2xl bg-[#0B1210]/95 backdrop-blur-xl text-slate-100 border border-emerald-400/30 shadow-[0_0_40px_rgba(16,185,129,0.1)] p-6 sm:p-8 space-y-5">
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-white">
                Want line-by-line proof on which deals are leaking?
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Send 3 recent closed deals. Within 48 hours we return a written
                line-by-line PDF report and async Loom walkthrough showing exact
                overpayments and uncollected referrals. 100% written delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
                <span>Line-by-line CDA audit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
                <span>Async Loom walkthrough in 48h</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
                <span>Actionable recovery PDF</span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <Link
                href="/free-audit"
                className="w-full h-12 px-5 rounded-xl bg-[#10B981] hover:bg-emerald-400 text-[#040807] font-bold text-base shadow-[0_0_24px_rgba(16,185,129,0.28)] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Request Written 3-Deal Audit</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>

              <p className="text-center text-xs font-mono text-slate-400">
                Confidential and encrypted. Zero live meetings required.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-400 pt-1">
        <span className="inline-flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-[#10B981]" />
          <span>Encrypted audit workspace</span>
        </span>
        <span aria-hidden="true" className="text-slate-700">
          ·
        </span>
        <span>Zero third-party sharing</span>
        <span aria-hidden="true" className="text-slate-700">
          ·
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
          <span>Built for 10–50 agent brokerages</span>
        </span>
      </div>
    </div>
  );
}
