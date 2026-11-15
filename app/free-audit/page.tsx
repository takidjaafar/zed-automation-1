'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Lock,
  ShieldCheck,
  Video,
} from 'lucide-react';

import AuditBrand from '@/components/commission-audit/AuditBrand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function FreeAuditPage() {
  const [brokerageName, setBrokerageName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [agentCount, setAgentCount] = useState('15');
  const [dealOne, setDealOne] = useState('');
  const [dealTwo, setDealTwo] = useState('');
  const [dealThree, setDealThree] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!brokerageName.trim() || !ownerName.trim() || !email.trim()) {
      setError('Please enter your name, brokerage name, and work email.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid work email address.');
      return;
    }

    if (!dealOne.trim() || !dealTwo.trim() || !dealThree.trim()) {
      setError(
        'Please provide basic details or property addresses for all 3 recent deals.'
      );
      return;
    }

    setError(null);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#05080F] text-slate-100 flex flex-col">
      {/* Unified Header */}
      <header className="border-b border-slate-800/80 bg-[#05080F]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <AuditBrand tag="Client Fulfillment Portal" />

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            <Link
              href="/commission-audit"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Audit Workspace
            </Link>
            <Link
              href="/commission-calculator"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Leakage Calculator
            </Link>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="https://zedautomation.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-[#0B1120] border border-slate-800 hover:border-slate-700 transition whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#10B981]" />
              Back to Zed Automation
            </a>
            <Link
              href="/commission-calculator"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-[#0B1120] border border-slate-800 hover:border-slate-700 transition whitespace-nowrap shrink-0"
            >
              <span>Calculator</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-14">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <div className="rounded-2xl bg-[#0B1120] text-slate-100 shadow-2xl shadow-black/60 border border-slate-800/80 overflow-hidden">
            {submitted ? (
              <div className="p-8 sm:p-10 space-y-6 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/15 text-[#10B981] border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    3-Deal Audit Request Received
                  </h1>
                  <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
                    Thank you, <span className="font-semibold text-white">{ownerName}</span>
                    . We&apos;ve queued the async audit for{' '}
                    <span className="font-semibold text-white">{brokerageName}</span>.
                    Expect your private Loom walkthrough and written PDF discrepancy
                    report at <span className="font-semibold text-[#10B981]">{email}</span>{' '}
                    within 48 hours.
                  </p>
                </div>

                <div className="rounded-xl bg-[#05080F] border border-slate-800/80 p-4 text-left text-xs text-slate-300 space-y-1.5">
                  <div className="font-semibold text-white">
                    Submitted Deal References:
                  </div>
                  <div>1. {dealOne}</div>
                  <div>2. {dealTwo}</div>
                  <div>3. {dealThree}</div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Button
                    asChild
                    className="bg-[#10B981] hover:bg-emerald-400 text-[#05080F] font-semibold"
                  >
                    <Link href="/commission-calculator">
                      Return to Calculator
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                    className="bg-[#05080F] border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    Edit Submission
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="px-6 sm:px-8 pt-7 pb-6 border-b border-slate-800/80">
                  <p className="text-xs font-medium text-[#10B981]">
                    Zed Automation · Async Written Audit · 48-Hour Turnaround
                  </p>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Request Your 3-Deal Commission Audit
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-slate-400 leading-relaxed">
                    Send 3 recent closed deals. Within 48 hours we deliver a
                    private Loom walkthrough and executive PDF report showing exact split
                    errors, referral fee leaks, and overpayments via email.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                      <Video className="h-3.5 w-3.5 text-[#10B981]" />
                      <span>Async Loom breakdown</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-[#10B981]" />
                      <span>Line-by-line PDF report</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
                      <span>100% written delivery</span>
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="owner-name"
                        className="text-sm font-semibold text-slate-200"
                      >
                        Your Name
                      </Label>
                      <Input
                        id="owner-name"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Jane Miller"
                        className="bg-[#05080F] border-slate-800 text-white placeholder:text-slate-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="brokerage-name"
                        className="text-sm font-semibold text-slate-200"
                      >
                        Brokerage Name
                      </Label>
                      <Input
                        id="brokerage-name"
                        value={brokerageName}
                        onChange={(e) => setBrokerageName(e.target.value)}
                        placeholder="Summit Realty Group"
                        className="bg-[#05080F] border-slate-800 text-white placeholder:text-slate-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="work-email"
                        className="text-sm font-semibold text-slate-200"
                      >
                        Work Email (for PDF + Loom delivery)
                      </Label>
                      <Input
                        id="work-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@summitrealty.com"
                        className="bg-[#05080F] border-slate-800 text-white placeholder:text-slate-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="agent-count"
                        className="text-sm font-semibold text-slate-200"
                      >
                        Active Agent Count
                      </Label>
                      <Input
                        id="agent-count"
                        type="number"
                        min={1}
                        value={agentCount}
                        onChange={(e) => setAgentCount(e.target.value)}
                        className="bg-[#05080F] border-slate-800 text-white font-mono tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <Label className="text-sm font-semibold text-slate-200 block">
                      3 Recent Closed Deals (Address, Sale Price, Split &amp;
                      Paid Amount)
                    </Label>
                    <Input
                      aria-label="Deal 1 details"
                      value={dealOne}
                      onChange={(e) => setDealOne(e.target.value)}
                      placeholder="Deal 1: e.g., 412 Oak Ridge Dr — $485,000, 3% side, 70/30 split, paid $10,850"
                      className="bg-[#05080F] border-slate-800 text-white placeholder:text-slate-500"
                      required
                    />
                    <Input
                      aria-label="Deal 2 details"
                      value={dealTwo}
                      onChange={(e) => setDealTwo(e.target.value)}
                      placeholder="Deal 2: e.g., 1904 Pinehurst Ave — $620,000, 2.5% side, 25% referral, paid $8,900"
                      className="bg-[#05080F] border-slate-800 text-white placeholder:text-slate-500"
                      required
                    />
                    <Input
                      aria-label="Deal 3 details"
                      value={dealThree}
                      onChange={(e) => setDealThree(e.target.value)}
                      placeholder="Deal 3: e.g., 88 Maplewood Ln — $390,000, 3% side, 80/20 split, paid $9,600"
                      className="bg-[#05080F] border-slate-800 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="audit-notes"
                      className="text-sm font-semibold text-slate-200"
                    >
                      Optional Notes (Transaction fees, cap rules, or referral
                      terms)
                    </Label>
                    <Textarea
                      id="audit-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g., $495 admin fee per side, 80/20 split until $18k cap..."
                      className="bg-[#05080F] border-slate-800 text-white placeholder:text-slate-500 min-h-20"
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-300 font-medium">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3 pt-1">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-12 rounded-xl bg-[#10B981] hover:bg-emerald-400 text-[#05080F] font-bold text-base shadow-lg shadow-emerald-500/10 cursor-pointer"
                    >
                      Submit 3 Deals for Written Audit →
                    </Button>
                    <p className="text-center text-xs text-slate-500">
                      Confidential &amp; encrypted. 100% written async audit.
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-[#10B981]" />
              <span>Encrypted delivery</span>
            </span>
            <span aria-hidden="true" className="text-slate-700">
              ·
            </span>
            <span>Zero third-party data sharing</span>
            <span aria-hidden="true" className="text-slate-700">
              ·
            </span>
            <span>Trusted by 10–50 agent brokerages</span>
          </div>
        </div>
      </main>
    </div>
  );
}
