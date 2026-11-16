'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, FileText, Lock, ShieldCheck, Video } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface WrittenAuditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialNotes?: string;
}

export default function WrittenAuditModal({
  open,
  onOpenChange,
  initialNotes = '',
}: WrittenAuditModalProps) {
  const [ownerName, setOwnerName] = useState('');
  const [brokerageName, setBrokerageName] = useState('');
  const [email, setEmail] = useState('');
  const [agentCount, setAgentCount] = useState('18');
  const [dealOne, setDealOne] = useState('');
  const [dealTwo, setDealTwo] = useState('');
  const [dealThree, setDealThree] = useState('');
  const [notes, setNotes] = useState(initialNotes);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialNotes) {
      setNotes(initialNotes);
    }
  }, [initialNotes]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ownerName.trim() || !brokerageName.trim() || !email.trim()) {
      setError('Enter your name, brokerage name, and work email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid work email address for written PDF delivery.');
      return;
    }

    if (!dealOne.trim() || !dealTwo.trim() || !dealThree.trim()) {
      setError('Enter closed deal references for all 3 transactions.');
      return;
    }

    setError(null);
    setSubmitted(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-[#0D1017] text-slate-100 border border-white/[0.12] border-t-white/[0.2] p-0 gap-0">
        {submitted ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#10B981]">
                <CheckCircle2 className="w-4 h-4" />
                Written Audit Queued
              </div>
              <h3 className="text-xl font-bold tracking-[-0.02em] text-white">
                3-Deal Commission Audit Request Received
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Thank you, <span className="text-white font-medium">{ownerName}</span>. Your forensic audit for{' '}
                <span className="text-white font-medium">{brokerageName}</span> has been logged. Expect a line-by-line PDF discrepancy report and private Loom walkthrough at{' '}
                <span className="text-[#10B981] font-mono">{email}</span> within 48 hours.
              </p>
            </div>

            <div className="rounded-lg bg-[#07090E] border border-white/[0.08] divide-y divide-white/[0.06] text-xs font-mono">
              <div className="px-4 py-2.5 text-slate-400 uppercase tracking-wider">
                Submitted Transaction References
              </div>
              <div className="px-4 py-2.5 text-slate-200">1. {dealOne}</div>
              <div className="px-4 py-2.5 text-slate-200">2. {dealTwo}</div>
              <div className="px-4 py-2.5 text-slate-200">3. {dealThree}</div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
              <span className="text-xs font-mono text-slate-500">
                100% async delivery · zakaria@zedautomations.tech
              </span>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-[#07090E] border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Edit Deals
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#07090E] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="px-6 pt-6 pb-5 border-b border-white/[0.08] text-left space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Async Written Audit · 48-Hour Turnaround · Written Delivery Only
              </div>
              <DialogTitle className="text-xl font-bold tracking-[-0.02em] text-white">
                Request Your 3-Deal Written Commission Audit
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-400 leading-relaxed">
                Submit 3 recent closed transactions. Receive a confidential PDF reconciliation ledger and private async Loom breakdown via email.
              </DialogDescription>
              <div className="pt-1 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-mono text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#10B981]" />
                  Line-by-line PDF ledger
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-[#10B981]" />
                  Async Loom walkthrough
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  Written delivery only
                </span>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="modal-owner-name" className="text-xs font-medium text-slate-300">
                    Your Name
                  </Label>
                  <Input
                    id="modal-owner-name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Zakaria Mansour"
                    className="bg-[#07090E] border-white/[0.1] text-white placeholder:text-slate-600 focus-visible:ring-[#10B981]/40"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="modal-brokerage-name" className="text-xs font-medium text-slate-300">
                    Brokerage Name
                  </Label>
                  <Input
                    id="modal-brokerage-name"
                    value={brokerageName}
                    onChange={(e) => setBrokerageName(e.target.value)}
                    placeholder="Summit Realty Group"
                    className="bg-[#07090E] border-white/[0.1] text-white placeholder:text-slate-600 focus-visible:ring-[#10B981]/40"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="modal-work-email" className="text-xs font-medium text-slate-300">
                    Work Email (PDF + Loom Delivery)
                  </Label>
                  <Input
                    id="modal-work-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="zakaria@zedautomations.tech"
                    className="bg-[#07090E] border-white/[0.1] text-white placeholder:text-slate-600 focus-visible:ring-[#10B981]/40"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="modal-agent-count" className="text-xs font-medium text-slate-300">
                    Active Agents
                  </Label>
                  <Input
                    id="modal-agent-count"
                    type="number"
                    min={1}
                    value={agentCount}
                    onChange={(e) => setAgentCount(e.target.value)}
                    className="bg-[#07090E] border-white/[0.1] text-white font-mono tabular-nums focus-visible:ring-[#10B981]/40"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-medium text-slate-300 block">
                  3 Recent Closed Deals (Address, Price, Split &amp; Paid Amount)
                </Label>
                <Input
                  aria-label="Closed deal 1 details"
                  value={dealOne}
                  onChange={(e) => setDealOne(e.target.value)}
                  placeholder="Deal 1: 412 Oak Ridge Dr — $485,000, 3% side, 70/30 split, paid $11,640"
                  className="bg-[#07090E] border-white/[0.1] text-white placeholder:text-slate-600 text-xs focus-visible:ring-[#10B981]/40"
                  required
                />
                <Input
                  aria-label="Closed deal 2 details"
                  value={dealTwo}
                  onChange={(e) => setDealTwo(e.target.value)}
                  placeholder="Deal 2: 1904 Pinehurst Ave — $620,000, 2.5% side, 25% referral, paid $15,500"
                  className="bg-[#07090E] border-white/[0.1] text-white placeholder:text-slate-600 text-xs focus-visible:ring-[#10B981]/40"
                  required
                />
                <Input
                  aria-label="Closed deal 3 details"
                  value={dealThree}
                  onChange={(e) => setDealThree(e.target.value)}
                  placeholder="Deal 3: 88 Maplewood Ln — $390,000, 3% side, 80/20 split, paid $9,855"
                  className="bg-[#07090E] border-white/[0.1] text-white placeholder:text-slate-600 text-xs focus-visible:ring-[#10B981]/40"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="modal-notes" className="text-xs font-medium text-slate-300">
                  Cap Rules, Admin Fees, or Context (Optional)
                </Label>
                <Textarea
                  id="modal-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., $495 compliance fee per side, 80/20 split until $18k cap..."
                  className="bg-[#07090E] border-white/[0.1] text-white placeholder:text-slate-600 min-h-20 text-xs focus-visible:ring-[#10B981]/40"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-3.5 py-2.5 text-xs text-rose-300 font-medium">
                  {error}
                </div>
              )}

              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  className="w-full h-11 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#07090E] font-semibold text-sm transition-colors cursor-pointer"
                >
                  Submit 3 Deals for Async Written Audit &rarr;
                </button>
                <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-500">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Encrypted async review · Direct email delivery via zakaria@zedautomations.tech</span>
                </div>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
