'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  ExternalLink,
  FileText,
  PlusCircle,
  RotateCcw,
  Trash2,
  Users,
} from 'lucide-react';

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
 * Commission Audit & Leakage Detector — working view.
 *
 * Multi-client: the client selector swaps between independently stored audits
 * (`audit_[clientId]_[auditId]`). The read-only client view lives at
 * `/commission-audit/view/[auditId]`.
 */
function CommissionAuditWorkspace() {
  const workspace = useAuditWorkspace();
  const { push } = useToast();

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

  /** Every mutation of the transaction list persists to the active audit. */
  const updateTransactions = (newList: Transaction[]) => {
    workspace.setTransactions(newList);
  };

  // Add transaction
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

  // Bulk CSV import — rows arrive already validated and normalized by the
  // CSV import engine (`lib/commission-audit/csv.ts`).
  const handleImportTransactions = (imported: Transaction[]) => {
    if (imported.length === 0) return;
    updateTransactions([...imported, ...transactions]);
  };

  // CSV Export
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <AuditBrand />

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/commission-audit.html"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              Standalone HTML View
            </Link>
            <button
              onClick={handleLoadSamples}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              Load Sample Data
            </button>
            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm"
              title="Export all transactions to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
            <button
              onClick={() => setIsReportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 transition shadow-sm shadow-emerald-500/20"
            >
              <FileText className="w-3.5 h-3.5" />
              Generate PDF Report
            </button>
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/50 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {!workspace.ready ? (
          <div className="py-24 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Loading your clients and audits…
            </div>
          </div>
        ) : (
          <>
            {workspace.storageUnavailable && (
              <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
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
            <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('manual')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                      activeTab === 'manual'
                        ? 'bg-white shadow-sm border border-slate-200 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Manual Transaction Entry
                  </button>
                  <button
                    onClick={() => setActiveTab('import')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                      activeTab === 'import'
                        ? 'bg-white shadow-sm border border-slate-200 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Import
                  </button>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Auto-saved · {activeClient?.name ?? 'no client'}
                  {activeAudit ? ` · ${activeAudit.name}` : ''}
                </div>
              </div>

              {activeTab === 'manual' ? (
                <div className="p-6">
                  <form onSubmit={handleAddTransaction} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Property Address */}
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Property Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. 742 Evergreen Terrace, Springfield"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                        />
                      </div>

                      {/* Sale Price */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Sale Price ($) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">$</span>
                          <input
                            type="number"
                            required
                            min="1"
                            step="0.01"
                            value={salePrice}
                            onChange={(e) => setSalePrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className="w-full pl-7 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                          />
                        </div>
                      </div>

                      {/* Total Comm Rate */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Total Comm. Rate (%) <span className="text-rose-500">*</span>
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
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-sm">%</span>
                        </div>
                      </div>

                      {/* Listing Split */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Listing Split (%) <span className="text-rose-500">*</span>
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
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-sm">%</span>
                        </div>
                      </div>

                      {/* Buyer Split */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Buyer Split (%) <span className="text-rose-500">*</span>
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
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-sm">%</span>
                        </div>
                      </div>

                      {/* Broker Cut */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Brokerage Cut (%) <span className="text-rose-500">*</span>
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
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-sm">%</span>
                        </div>
                      </div>

                      {/* Referral Out */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
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
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-sm">%</span>
                        </div>
                      </div>

                      {/* Referral In */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Referral Fee In ($)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={referralIn}
                            onChange={(e) => setReferralIn(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className="w-full pl-7 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                          />
                        </div>
                      </div>

                      {/* Transaction Fee */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Transaction Fee ($)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={transactionFee}
                            onChange={(e) => setTransactionFee(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className="w-full pl-7 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                          />
                        </div>
                      </div>

                      {/* Actual Amount Paid */}
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Actual Amount Paid to Agent ($) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">$</span>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={actualPaid}
                            onChange={(e) => setActualPaid(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className="w-full pl-7 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Form Action */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition flex items-center gap-2"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-400" />
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Audit Calculation Trace</h3>
                <p className="text-xs text-slate-500">{inspectTx.address}</p>
              </div>
              <button
                onClick={() => setInspectTx(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            {(() => {
              const a = calculateAudit(inspectTx);
              return (
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px] space-y-1.5">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">1. Total Commission ({formatPercent(inspectTx.commRate)}):</span>
                      <span className="font-bold text-slate-800">{formatMoney(a.totalCommission)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">2. Listing Side Commission ({formatPercent(inspectTx.listingSplit)}):</span>
                      <span className="font-bold text-slate-800">{formatMoney(a.listingCommission)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">3. Buyer Side Commission ({formatPercent(inspectTx.buyerSplit)}):</span>
                      <span className="font-bold text-slate-800">{formatMoney(a.buyerCommission)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">4. Referral Fee Out ({formatPercent(inspectTx.referralOut)} of Listing):</span>
                      <span className="font-bold text-rose-600">-{formatMoney(a.referralFeeOutAmount)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">5. Amount After Referral:</span>
                      <span className="font-bold text-slate-800">{formatMoney(a.amountAfterReferral)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">6. Brokerage Cut ({formatPercent(inspectTx.brokerSplit)}):</span>
                      <span className="font-bold text-rose-600">-{formatMoney(a.brokerageCut)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">7. Transaction Fee:</span>
                      <span className="font-bold text-rose-600">-{formatMoney(inspectTx.transactionFee)}</span>
                    </div>
                    <div className="flex justify-between bg-emerald-50 p-1.5 rounded border border-emerald-200 font-semibold">
                      <span className="text-emerald-800">8. EXPECTED AGENT PAYMENT:</span>
                      <span className="text-emerald-800 text-sm">{formatMoney(a.expectedAgentPayment)}</span>
                    </div>
                    <div className="flex justify-between bg-slate-100 p-1.5 rounded font-semibold">
                      <span className="text-slate-700">Actual Amount Paid:</span>
                      <span className="text-slate-900 text-sm">{formatMoney(inspectTx.actualPaid)}</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg ${a.status === 'overpaid' ? 'bg-rose-50 border border-rose-200 text-rose-900' : a.status === 'underpaid' ? 'bg-amber-50 border border-amber-200 text-amber-900' : 'bg-emerald-50 border border-emerald-200 text-emerald-900'}`}>
                    <div className="font-bold text-xs uppercase tracking-wider mb-1">Audit Finding:</div>
                    <p className="text-xs">
                      {a.status === 'overpaid' && `Brokerage OVERPAID agent by ${formatMoney(a.discrepancy)}. Discrepancy represents recoverable leakage.`}
                      {a.status === 'underpaid' && `Brokerage UNDERPAID agent by ${formatMoney(Math.abs(a.discrepancy))}. Agent is owed additional payout.`}
                      {a.status === 'correct' && `Calculations match disbursement exactly. No variance detected.`}
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectTx(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Report Generator */}
      <PdfReportDialog
        open={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        transactions={transactions}
        defaultClientName={activeClient?.name ?? ''}
        defaultCompany={activeClient?.company ?? ''}
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
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; Zed Automation — Real Estate Commission Audit &amp; Leakage Detection System</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-emerald-600 hover:underline">
              Home
            </Link>
            <span>&bull;</span>
            <Link href="/clients" className="text-emerald-600 hover:underline inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Clients
            </Link>
            <span>&bull;</span>
            <Link href="/dashboard" className="text-emerald-600 hover:underline">
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
      <CommissionAuditWorkspace />
    </ToastProvider>
  );
}
