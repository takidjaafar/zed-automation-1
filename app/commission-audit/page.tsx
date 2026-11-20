'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Lock,
  PlusCircle,
  RotateCcw,
  Trash2,
  Users,
} from 'lucide-react';

import AuditAccessGate, { useAuditGate } from '@/components/commission-audit/AuditAccessGate';
import AuditBrand from '@/components/commission-audit/AuditBrand';
import AuditKpiDashboard from '@/components/commission-audit/AuditKpiDashboard';
import ClientSelector from '@/components/commission-audit/ClientSelector';
import CsvImportPanel from '@/components/commission-audit/CsvImportPanel';
import NewAuditDialog from '@/components/commission-audit/NewAuditDialog';
import PdfReportDialog from '@/components/commission-audit/PdfReportDialog';
import ShareAuditDialog from '@/components/commission-audit/ShareAuditDialog';
import TransactionTable from '@/components/commission-audit/TransactionTable';
import { ToastProvider, useToast } from '@/components/commission-audit/toast';
import { useAuditWorkspace } from '@/hooks/commission-audit/use-audit-workspace';
import { calculateAudit } from '@/lib/commission-audit/audit';
import { formatMoney, formatPercent } from '@/lib/commission-audit/format';
import { INITIAL_SAMPLES } from '@/lib/commission-audit/samples';
import type { Transaction } from '@/types/commission-audit';

/**
 * Commission Audit & Leakage Detector — private client-gated fulfillment workspace.
 */
function CommissionAuditWorkspace() {
  const workspace = useAuditWorkspace();
  const { push } = useToast();
  const { lockWorkspace } = useAuditGate();

  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');
  const [inspectTx, setInspectTx] = useState<Transaction | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isNewAuditOpen, setIsNewAuditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Form states
  const [address, setAddress] = useState('');
  const [salePrice, setSalePrice] = useState<number | ''>(450000);
  const [commRate, setCommRate] = useState<number | ''>(6.0);
  const [listingSplit, setListingSplit] = useState<number | ''>(50);
  const [buyerSplit, setBuyerSplit] = useState<number | ''>(50);
  const [brokerSplit, setBrokerSplit] = useState<number | ''>(30);
  const [referralOut, setReferralOut] = useState<number | ''>(0);
  const [referralIn, setReferralIn] = useState<number | ''>(0);
  const [transactionFee, setTransactionFee] = useState<number | ''>(0);
  const [actualPaid, setActualPaid] = useState<number | ''>(9200);

  const { transactions, activeClient, activeAudit } = workspace;

  const updateTransactions = (newList: Transaction[]) => {
    workspace.setTransactions(newList);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      address: address.trim(),
      salePrice: Number(salePrice) || 0,
      commRate: Number(commRate) || 0,
      listingSplit: Number(listingSplit) || 0,
      buyerSplit: Number(buyerSplit) || 0,
      brokerSplit: Number(brokerSplit) || 0,
      referralOut: Number(referralOut) || 0,
      referralIn: Number(referralIn) || 0,
      transactionFee: Number(transactionFee) || 0,
      actualPaid: Number(actualPaid) || 0,
    };

    updateTransactions([newTx, ...transactions]);
    setAddress('');
    setSalePrice(450000);
    setCommRate(6);
    setListingSplit(50);
    setBuyerSplit(50);
    setBrokerSplit(30);
    setReferralOut(0);
    setReferralIn(0);
    setTransactionFee(0);
    setActualPaid(9200);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this audit record?')) {
      updateTransactions(transactions.filter((t) => t.id !== id));
    }
  };

  const handleClearAll = () => {
    if (confirm(`Clear all ${transactions.length} records from "${activeAudit?.name ?? 'this audit'}"?`)) {
      updateTransactions([]);
      push({
        tone: 'info',
        title: 'Audit cleared',
        description: activeAudit ? `"${activeAudit.name}" now contains no transactions.` : undefined,
      });
    }
  };

  const handleLoadSamples = () => {
    updateTransactions([...INITIAL_SAMPLES]);
    push({
      tone: 'success',
      title: 'Sample data loaded',
      description: '5 illustrative deals were added to the active audit.',
    });
  };

  const handleImportTransactions = (imported: Transaction[]) => {
    if (imported.length === 0) return;
    updateTransactions([...imported, ...transactions]);
    push({
      tone: 'success',
      title: 'Transactions imported',
      description: `Successfully added ${imported.length} transaction${imported.length === 1 ? '' : 's'} to audit records.`,
    });
  };

  const handleDownloadCSV = () => {
    if (transactions.length === 0) {
      push({
        tone: 'info',
        title: 'No transactions to export',
        description: 'Add or import transactions before exporting CSV.',
      });
      return;
    }

    const headers = [
      'Property Address',
      'Sale Price',
      'Total Comm %',
      'Total Comm $',
      'Listing Split %',
      'Buyer Split %',
      'Listing Comm $',
      'Referral Out %',
      'Referral Out $',
      'Broker Cut %',
      'Broker Cut $',
      'Transaction Fee $',
      'Expected Agent Pay $',
      'Actual Amount Paid $',
      'Discrepancy $',
      'Status',
      'Missing Referral In $',
    ];

    let totalSalePrice = 0;
    let totalCommission = 0;
    let totalListingComm = 0;
    let totalRefOut = 0;
    let totalBrokerCut = 0;
    let totalTxFee = 0;
    let totalExpectedPay = 0;
    let totalActualPaid = 0;
    let totalDiscrepancy = 0;
    let totalReferralIn = 0;

    const rows = transactions.map((t) => {
      const a = calculateAudit(t);
      totalSalePrice += Number(t.salePrice) || 0;
      totalCommission += a.totalCommission;
      totalListingComm += a.listingCommission;
      totalRefOut += a.referralFeeOutAmount;
      totalBrokerCut += a.brokerageCut;
      totalTxFee += Number(t.transactionFee) || 0;
      totalExpectedPay += a.expectedAgentPayment;
      totalActualPaid += Number(t.actualPaid) || 0;
      totalDiscrepancy += a.discrepancy;
      totalReferralIn += Number(t.referralIn) || 0;

      return [
        `"${t.address.replace(/"/g, '""')}"`,
        (Number(t.salePrice) || 0).toFixed(2),
        (Number(t.commRate) || 0).toFixed(2),
        a.totalCommission.toFixed(2),
        (Number(t.listingSplit) || 0).toFixed(2),
        (Number(t.buyerSplit) || 0).toFixed(2),
        a.listingCommission.toFixed(2),
        (Number(t.referralOut) || 0).toFixed(2),
        a.referralFeeOutAmount.toFixed(2),
        (Number(t.brokerSplit) || 0).toFixed(2),
        a.brokerageCut.toFixed(2),
        (Number(t.transactionFee) || 0).toFixed(2),
        a.expectedAgentPayment.toFixed(2),
        (Number(t.actualPaid) || 0).toFixed(2),
        a.discrepancy.toFixed(2),
        `"${a.statusText}"`,
        (Number(t.referralIn) || 0).toFixed(2),
      ].join(',');
    });

    const totalsRow = [
      '"TOTALS"',
      totalSalePrice.toFixed(2),
      '""',
      totalCommission.toFixed(2),
      '""',
      '""',
      totalListingComm.toFixed(2),
      '""',
      totalRefOut.toFixed(2),
      '""',
      totalBrokerCut.toFixed(2),
      totalTxFee.toFixed(2),
      totalExpectedPay.toFixed(2),
      totalActualPaid.toFixed(2),
      totalDiscrepancy.toFixed(2),
      '""',
      totalReferralIn.toFixed(2),
    ].join(',');

    const csvContent = [headers.join(','), ...rows, totalsRow].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `commission_audit_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    push({
      tone: 'success',
      title: 'CSV report downloaded',
      description: `Exported ${transactions.length} transactions with totals.`,
    });
  };

  const handleCreateAudit = (args: {
    clientId: string;
    name: string;
    periodStart: string;
    periodEnd: string;
  }) => {
    const created = workspace.createAudit(args);
    const client = workspace.clients.find((item) => item.id === args.clientId);
    if (created) {
      push({
        tone: 'success',
        title: 'Audit created',
        description: `"${created.name}" was filed under ${client?.name ?? 'the selected client'}.`,
      });
    }
  };

  const shareUrl = activeAudit ? workspace.buildShareUrl(activeAudit.id) : '';
  const inputClass =
    'w-full px-3.5 py-2.5 rounded-lg border border-emerald-400/20 bg-[#040807]/90 text-white placeholder:text-slate-600 text-sm focus:ring-2 focus:ring-emerald-400/40 focus:border-[#10B981] outline-none transition';

  return (
    <div className="min-h-screen bg-[#040807] text-slate-100 flex flex-col font-sans relative">
      {/* Subtle top emerald atmospheric glow matching landing page */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.09),transparent_65%)] z-0"
      />

      {/* Unified Executive Glass Top Navbar */}
      <header className="bg-[#040807]/85 backdrop-blur-xl border-b border-emerald-400/15 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-6">
          <AuditBrand tag="Client Fulfillment Portal" />

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            <Link
              href="/commission-audit"
              className="text-emerald-300 font-semibold whitespace-nowrap shrink-0"
            >
              Audit Workspace
            </Link>
            <Link
              href="/commission-calculator"
              className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
            >
              Leakage Calculator
            </Link>
            <Link
              href="/clients"
              className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
            >
              Clients
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Zed Automation
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#10B981] text-[#040807] hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.28)] transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Executive Report
            </button>
            <button
              type="button"
              onClick={lockWorkspace}
              title="Re-lock the private audit terminal"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-medium rounded-lg bg-[#0B1210]/90 text-slate-300 hover:text-emerald-300 border border-emerald-400/20 hover:border-emerald-400/45 transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Lock Workspace</span>
              <span className="sm:hidden">Lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {!workspace.ready ? (
          <div className="py-24 text-center text-sm font-mono text-slate-400">
            Loading brokerage ledgers and audits…
          </div>
        ) : (
          <>
            {/* Workspace Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-emerald-400/15">
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <Link
                  href="/"
                  className="md:hidden inline-flex items-center gap-1 text-emerald-300 hover:underline whitespace-nowrap shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Zed Automation
                </Link>
                <span className="hidden sm:inline text-slate-300">
                  Private GCI Audit Terminal{' '}
                  <span className="text-emerald-400/40">&middot;</span>{' '}
                  <span className="text-emerald-300">{activeClient?.name ?? 'Brokerage'}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSamples}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0B1210]/90 text-slate-200 hover:text-white border border-emerald-400/20 hover:border-emerald-400/40 transition whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#10B981]" />
                  Load Sample Data
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0B1210]/90 text-emerald-300 hover:bg-emerald-950/60 border border-emerald-400/30 transition whitespace-nowrap shrink-0 cursor-pointer"
                  title="Export all transactions to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CSV
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-950/35 text-rose-300 hover:bg-rose-950/65 border border-rose-500/30 transition whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            </div>

            {workspace.storageUnavailable && (
              <section className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-4 text-xs text-amber-200">
                This browser is blocking local storage, so audits cannot be saved. Enable storage
                (or leave private browsing) to keep clients and audits between visits.
              </section>
            )}

            {/* Client + audit switcher */}
            <ClientSelector
              clients={workspace.clients}
              activeClientId={workspace.activeClient?.id ?? null}
              audits={workspace.audits}
              activeAuditId={activeAudit?.id ?? null}
              onSelectClient={workspace.selectClient}
              onSelectAudit={workspace.selectAudit}
              onNewAudit={() => setIsNewAuditOpen(true)}
              onShare={() => setIsShareOpen(true)}
            />

            {/* KPI Summary Dashboard */}
            <AuditKpiDashboard transactions={transactions} />

            {/* Input Card */}
            <section className="bg-[#0B1210]/90 backdrop-blur-xl rounded-2xl border border-emerald-400/15 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <div className="border-b border-emerald-400/15 px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-[#040807]/60">
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#040807]/95 border border-emerald-400/20">
                  <button
                    type="button"
                    onClick={() => setActiveTab('manual')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === 'manual'
                        ? 'bg-[#10B981] text-[#040807]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Manual Transaction Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('import')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === 'import'
                        ? 'bg-[#10B981] text-[#040807]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    CSV Import
                  </button>
                </div>
                <div className="text-xs font-mono text-slate-400 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>
                    Auto-saved &middot; {activeClient?.name ?? 'No client'}
                    {activeAudit ? ` · ${activeAudit.name}` : ''}
                  </span>
                </div>
              </div>

              {activeTab === 'manual' ? (
                <div className="p-6">
                  <form onSubmit={handleAddTransaction} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Property Address */}
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Property Address <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. 742 Evergreen Terrace, Springfield"
                          className={inputClass}
                        />
                      </div>

                      {/* Sale Price */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Sale Price ($) <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-sm">$</span>
                          <input
                            type="number"
                            required
                            min="1"
                            step="0.01"
                            value={salePrice}
                            onChange={(e) => setSalePrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className={`${inputClass} pl-7 font-mono tabular-nums`}
                          />
                        </div>
                      </div>

                      {/* Total Comm Rate */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Total Comm. Rate (%) <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min="0.1"
                            max="100"
                            step="0.01"
                            value={commRate}
                            onChange={(e) => setCommRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className={`${inputClass} pr-8 font-mono tabular-nums`}
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 text-sm">%</span>
                        </div>
                      </div>

                      {/* Listing Split */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Listing Split (%) <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min="0"
                            max="100"
                            step="0.01"
                            value={listingSplit}
                            onChange={(e) => setListingSplit(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className={`${inputClass} pr-8 font-mono tabular-nums`}
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 text-sm">%</span>
                        </div>
                      </div>

                      {/* Buyer Split */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Buyer Split (%) <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min="0"
                            max="100"
                            step="0.01"
                            value={buyerSplit}
                            onChange={(e) => setBuyerSplit(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className={`${inputClass} pr-8 font-mono tabular-nums`}
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 text-sm">%</span>
                        </div>
                      </div>

                      {/* Broker Cut */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Brokerage Cut (%) <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min="0"
                            max="100"
                            step="0.01"
                            value={brokerSplit}
                            onChange={(e) => setBrokerSplit(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className={`${inputClass} pr-8 font-mono tabular-nums`}
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 text-sm">%</span>
                        </div>
                      </div>

                      {/* Referral Out */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Referral Fee Out (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={referralOut}
                            onChange={(e) => setReferralOut(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className={`${inputClass} pr-8 font-mono tabular-nums`}
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 text-sm">%</span>
                        </div>
                      </div>

                      {/* Referral In */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Referral Fee In ($)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-sm">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={referralIn}
                            onChange={(e) => setReferralIn(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className={`${inputClass} pl-7 font-mono tabular-nums`}
                          />
                        </div>
                      </div>

                      {/* Transaction Fee */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Transaction Fee ($)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-sm">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={transactionFee}
                            onChange={(e) => setTransactionFee(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className={`${inputClass} pl-7 font-mono tabular-nums`}
                          />
                        </div>
                      </div>

                      {/* Actual Amount Paid */}
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Actual Amount Paid to Agent ($) <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-sm">$</span>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={actualPaid}
                            onChange={(e) => setActualPaid(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className={`${inputClass} pl-7 font-mono tabular-nums`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Form Action */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 text-sm font-bold rounded-lg bg-[#10B981] text-[#040807] hover:bg-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.25)] transition flex items-center gap-2 cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Audit &amp; Add Transaction
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <CsvImportPanel
                  onImport={handleImportTransactions}
                  existingCount={transactions.length}
                />
              )}
            </section>

            {/* Audited Records Table */}
            <TransactionTable
              transactions={transactions}
              onDelete={handleDelete}
              onInspect={setInspectTx}
            />
          </>
        )}
      </main>

      {/* Math Inspection Modal */}
      {inspectTx && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1210]/95 backdrop-blur-2xl rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(16,185,129,0.16)] space-y-4 border border-emerald-400/25 text-slate-100">
            <div className="flex items-center justify-between border-b border-emerald-400/15 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Audit Calculation Trace</h3>
                <p className="text-xs text-slate-400">{inspectTx.address}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectTx(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {(() => {
              const a = calculateAudit(inspectTx);
              return (
                <div className="space-y-3">
                  <div className="bg-[#040807]/90 p-3.5 rounded-xl border border-emerald-400/15 font-mono tabular-nums text-[11px] space-y-2">
                    <div className="flex justify-between border-b border-emerald-400/10 pb-1.5">
                      <span className="text-slate-400">1. Total Commission ({formatPercent(inspectTx.commRate)}):</span>
                      <span className="font-bold text-white">{formatMoney(a.totalCommission)}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-400/10 pb-1.5">
                      <span className="text-slate-400">2. Listing Side Commission ({formatPercent(inspectTx.listingSplit)}):</span>
                      <span className="font-bold text-white">{formatMoney(a.listingCommission)}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-400/10 pb-1.5">
                      <span className="text-slate-400">3. Buyer Side Commission ({formatPercent(inspectTx.buyerSplit)}):</span>
                      <span className="font-bold text-white">{formatMoney(a.buyerCommission)}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-400/10 pb-1.5">
                      <span className="text-slate-400">4. Referral Fee Out ({formatPercent(inspectTx.referralOut)} of Listing):</span>
                      <span className="font-bold text-rose-400">-{formatMoney(a.referralFeeOutAmount)}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-400/10 pb-1.5">
                      <span className="text-slate-400">5. Amount After Referral:</span>
                      <span className="font-bold text-white">{formatMoney(a.amountAfterReferral)}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-400/10 pb-1.5">
                      <span className="text-slate-400">6. Brokerage Cut ({formatPercent(inspectTx.brokerSplit)}):</span>
                      <span className="font-bold text-rose-400">-{formatMoney(a.brokerageCut)}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-400/10 pb-1.5">
                      <span className="text-slate-400">7. Transaction Fee:</span>
                      <span className="font-bold text-rose-400">-{formatMoney(inspectTx.transactionFee)}</span>
                    </div>
                    <div className="flex justify-between bg-emerald-950/45 p-2 rounded-lg border border-emerald-400/30 font-semibold">
                      <span className="text-emerald-300">8. EXPECTED AGENT PAYMENT:</span>
                      <span className="text-emerald-300 text-sm">{formatMoney(a.expectedAgentPayment)}</span>
                    </div>
                    <div className="flex justify-between bg-white/[0.04] p-2 rounded-lg font-semibold">
                      <span className="text-slate-300">Actual Amount Paid:</span>
                      <span className="text-white text-sm">{formatMoney(inspectTx.actualPaid)}</span>
                    </div>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border ${
                      a.status === 'overpaid'
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : a.status === 'underpaid'
                          ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                          : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    }`}
                  >
                    <div className="font-bold text-xs mb-1">Audit Finding</div>
                    <p className="text-xs leading-relaxed">
                      {a.status === 'overpaid' && `Brokerage OVERPAID agent by ${formatMoney(a.discrepancy)}. Discrepancy represents recoverable leakage.`}
                      {a.status === 'underpaid' && `Brokerage UNDERPAID agent by ${formatMoney(Math.abs(a.discrepancy))}. Agent is owed additional payout.`}
                      {a.status === 'correct' && `Calculations match disbursement exactly. No variance detected.`}
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="pt-2 border-t border-emerald-400/15 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectTx(null)}
                className="px-4 py-2 bg-[#10B981] text-[#040807] text-xs font-bold rounded-lg hover:bg-emerald-400 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Executive Report Generator */}
      <PdfReportDialog
        open={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        transactions={transactions}
        defaultClientName={activeClient?.name ?? ''}
        defaultCompany={activeClient?.company ?? ''}
        defaultContactEmail={activeClient?.email ?? ''}
      />

      {/* New audit */}
      <NewAuditDialog
        open={isNewAuditOpen}
        onClose={() => setIsNewAuditOpen(false)}
        clients={workspace.clients}
        defaultClientId={workspace.activeClient?.id ?? null}
        onCreate={handleCreateAudit}
      />

      {/* Read-only share link */}
      <ShareAuditDialog
        open={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        audit={activeAudit}
        client={activeClient}
        shareUrl={shareUrl}
      />

      {/* Footer */}
      <footer className="relative z-10 bg-[#040807]/90 border-t border-emerald-400/15 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; Zed Automation &mdash; Real Estate Commission Audit &amp; Leakage Detection</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-emerald-300 hover:underline">
              Home
            </Link>
            <span className="text-emerald-400/30">&middot;</span>
            <Link href="/commission-calculator" className="text-slate-300 hover:text-emerald-300 transition-colors">
              Leakage Calculator
            </Link>
            <span className="text-emerald-400/30">&middot;</span>
            <Link href="/clients" className="text-slate-300 hover:text-emerald-300 transition-colors inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Clients
            </Link>
            <span className="text-emerald-400/30">&middot;</span>
            <Link href="/dashboard" className="text-slate-300 hover:text-emerald-300 transition-colors">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CommissionAuditPage() {
  return (
    <ToastProvider>
      <AuditAccessGate>
        <CommissionAuditWorkspace />
      </AuditAccessGate>
    </ToastProvider>
  );
}
