'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Video,
} from 'lucide-react';

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
import {
  AUDIT_DESK_EMAIL,
  auditIntakeSchema,
  buildAuditMailtoUrl,
  formatAuditBrief,
  generateAuditReferenceId,
  type AuditIntakePayload,
} from '@/lib/commission-audit/audit-intake';
import { copyTextToClipboard } from '@/lib/commission-audit/clipboard';

export interface WrittenAuditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialNotes?: string;
}

interface ConfirmedAuditState {
  payload: AuditIntakePayload;
  referenceId: string;
  submittedAt: string;
  savedToServer: boolean;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<ConfirmedAuditState | null>(null);
  const [copiedBrief, setCopiedBrief] = useState(false);

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

  const formattedBrief = useMemo(() => {
    if (!confirmed) return '';
    return formatAuditBrief(
      confirmed.payload,
      confirmed.referenceId,
      confirmed.submittedAt,
    );
  }, [confirmed]);

  const mailtoUrl = useMemo(() => {
    if (!confirmed) return `mailto:${AUDIT_DESK_EMAIL}`;
    return buildAuditMailtoUrl(
      confirmed.payload,
      confirmed.referenceId,
      confirmed.submittedAt,
    );
  }, [confirmed]);

  const handleCopyBrief = async () => {
    if (!formattedBrief) return;
    const ok = await copyTextToClipboard(formattedBrief);
    if (ok) {
      setCopiedBrief(true);
      window.setTimeout(() => setCopiedBrief(false), 2600);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const parsed = auditIntakeSchema.safeParse({
      ownerName,
      brokerageName,
      email,
      agentCount,
      dealOne,
      dealTwo,
      dealThree,
      notes,
    });

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ??
          'Enter your brokerage details and all 3 closed transactions.',
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setCopiedBrief(false);

    try {
      const response = await fetch('/api/audit-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      if (response.ok) {
        const result = (await response.json()) as {
          referenceId?: string;
          submittedAt?: string;
        };
        setConfirmed({
          payload: parsed.data,
          referenceId: result.referenceId ?? generateAuditReferenceId(),
          submittedAt: result.submittedAt ?? new Date().toISOString(),
          savedToServer: true,
        });
      } else {
        setConfirmed({
          payload: parsed.data,
          referenceId: generateAuditReferenceId(),
          submittedAt: new Date().toISOString(),
          savedToServer: false,
        });
      }
    } catch {
      setConfirmed({
        payload: parsed.data,
        referenceId: generateAuditReferenceId(),
        submittedAt: new Date().toISOString(),
        savedToServer: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-[#0B1210]/95 backdrop-blur-2xl text-slate-100 border border-emerald-400/30 shadow-[0_0_60px_rgba(16,185,129,0.2)] p-0 gap-0">
        {confirmed ? (
          <div className="p-5 sm:p-8 space-y-5">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {confirmed.savedToServer
                    ? 'Logged to Zed Audit Desk'
                    : 'Audit Brief Ready for Direct Dispatch'}
                </div>
                <span className="text-[11px] font-mono text-emerald-300/90 tabular-nums">
                  Ref {confirmed.referenceId}
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-[-0.02em] text-white">
                3-Deal Commission Audit Request Confirmed
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Thank you,{' '}
                <span className="text-white font-medium">
                  {confirmed.payload.ownerName}
                </span>
                . Your forensic audit for{' '}
                <span className="text-white font-medium">
                  {confirmed.payload.brokerageName}
                </span>{' '}
                {confirmed.savedToServer
                  ? 'has been saved to our audit queue.'
                  : 'is formatted below for one-click dispatch.'}{' '}
                Expect a line-by-line PDF discrepancy report and private Loom
                walkthrough at{' '}
                <span className="text-emerald-400 font-mono break-all">
                  {confirmed.payload.email}
                </span>{' '}
                within 48 hours.
              </p>
            </div>

            <div className="rounded-lg bg-[#040807]/85 border border-emerald-400/20 divide-y divide-emerald-400/10 text-xs font-mono">
              <div className="px-4 py-2.5 flex items-center justify-between gap-2 text-slate-400 uppercase tracking-wider">
                <span>Submitted Transaction References</span>
                <span className="text-emerald-400/90 tabular-nums">
                  {confirmed.payload.agentCount} Agents
                </span>
              </div>
              <div className="px-4 py-2.5 text-slate-100 break-words">
                1. {confirmed.payload.dealOne}
              </div>
              <div className="px-4 py-2.5 text-slate-100 break-words">
                2. {confirmed.payload.dealTwo}
              </div>
              <div className="px-4 py-2.5 text-slate-100 break-words">
                3. {confirmed.payload.dealThree}
              </div>
            </div>

            {/* Guaranteed Dual-Backup Lead Delivery Actions */}
            <div className="rounded-xl bg-[#040807]/90 border border-emerald-400/25 p-4 space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                Keep a Copy or Send Directly to Audit Desk
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyBrief}
                  className="inline-flex items-center justify-center gap-2 h-10 px-3.5 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#040807] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedBrief ? (
                    <>
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      Copied Audit Brief
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      Copy Formatted Audit Brief
                    </>
                  )}
                </button>

                <a
                  href={mailtoUrl}
                  className="inline-flex items-center justify-center gap-2 h-10 px-3.5 rounded-lg bg-[#0B1210] hover:bg-emerald-400/10 border border-emerald-400/35 text-emerald-300 hover:text-emerald-200 text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  Email Pre-Filled Brief
                </a>
              </div>
              <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                Direct fallback desk:{' '}
                <a
                  href={mailtoUrl}
                  className="text-emerald-300 hover:underline break-all"
                >
                  {AUDIT_DESK_EMAIL}
                </a>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-emerald-400/15">
              <span className="text-xs font-mono text-slate-400">
                100% async delivery · {AUDIT_DESK_EMAIL}
              </span>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setConfirmed(null)}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-[#040807]/80 border border-white/15 text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  Edit Deals
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="px-5 sm:px-6 pt-6 pb-5 border-b border-emerald-400/15 text-left space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-300/90">
                Async Written Audit · 48-Hour Turnaround · Written Delivery Only
              </div>
              <DialogTitle className="text-xl font-bold tracking-[-0.02em] text-white">
                Request Your 3-Deal Written Commission Audit
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-300 leading-relaxed">
                Submit 3 recent closed transactions. Receive a confidential PDF
                reconciliation ledger and private async Loom breakdown via
                email.
              </DialogDescription>
              <div className="pt-1 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-mono text-slate-200">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  Line-by-line PDF ledger
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-emerald-400" />
                  Async Loom walkthrough
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Written delivery only
                </span>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="modal-owner-name"
                    className="text-xs font-medium text-slate-200"
                  >
                    Your Name
                  </Label>
                  <Input
                    id="modal-owner-name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Zakaria Mansour"
                    className="bg-[#040807]/80 border-emerald-400/20 text-white placeholder:text-slate-500 focus-visible:ring-emerald-400/40"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="modal-brokerage-name"
                    className="text-xs font-medium text-slate-200"
                  >
                    Brokerage Name
                  </Label>
                  <Input
                    id="modal-brokerage-name"
                    value={brokerageName}
                    onChange={(e) => setBrokerageName(e.target.value)}
                    placeholder="Summit Realty Group"
                    className="bg-[#040807]/80 border-emerald-400/20 text-white placeholder:text-slate-500 focus-visible:ring-emerald-400/40"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="modal-work-email"
                    className="text-xs font-medium text-slate-200"
                  >
                    Work Email (PDF + Loom Delivery)
                  </Label>
                  <Input
                    id="modal-work-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="zakaria@zedautomations.tech"
                    className="bg-[#040807]/80 border-emerald-400/20 text-white placeholder:text-slate-500 focus-visible:ring-emerald-400/40"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="modal-agent-count"
                    className="text-xs font-medium text-slate-200"
                  >
                    Active Agents
                  </Label>
                  <Input
                    id="modal-agent-count"
                    type="number"
                    min={1}
                    value={agentCount}
                    onChange={(e) => setAgentCount(e.target.value)}
                    className="bg-[#040807]/80 border-emerald-400/20 text-white font-mono tabular-nums focus-visible:ring-emerald-400/40"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-medium text-slate-200 block">
                  3 Recent Closed Deals (Address, Price, Split &amp; Paid Amount)
                </Label>
                <Input
                  aria-label="Closed deal 1 details"
                  value={dealOne}
                  onChange={(e) => setDealOne(e.target.value)}
                  placeholder="Deal 1: 412 Oak Ridge Dr — $485,000, 3% side, 70/30 split, paid $11,640"
                  className="bg-[#040807]/80 border-emerald-400/20 text-white placeholder:text-slate-500 text-xs focus-visible:ring-emerald-400/40"
                  required
                />
                <Input
                  aria-label="Closed deal 2 details"
                  value={dealTwo}
                  onChange={(e) => setDealTwo(e.target.value)}
                  placeholder="Deal 2: 1904 Pinehurst Ave — $620,000, 2.5% side, 25% referral, paid $15,500"
                  className="bg-[#040807]/80 border-emerald-400/20 text-white placeholder:text-slate-500 text-xs focus-visible:ring-emerald-400/40"
                  required
                />
                <Input
                  aria-label="Closed deal 3 details"
                  value={dealThree}
                  onChange={(e) => setDealThree(e.target.value)}
                  placeholder="Deal 3: 88 Maplewood Ln — $390,000, 3% side, 80/20 split, paid $9,855"
                  className="bg-[#040807]/80 border-emerald-400/20 text-white placeholder:text-slate-500 text-xs focus-visible:ring-emerald-400/40"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="modal-notes"
                  className="text-xs font-medium text-slate-200"
                >
                  Cap Rules, Admin Fees, or Context (Optional)
                </Label>
                <Textarea
                  id="modal-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., $495 compliance fee per side, 80/20 split until $18k cap..."
                  className="bg-[#040807]/80 border-emerald-400/20 text-white placeholder:text-slate-500 min-h-20 text-xs focus-visible:ring-emerald-400/40"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-3.5 py-2.5 text-xs text-rose-300 font-medium"
                >
                  {error}
                </div>
              )}

              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-lg bg-[#10B981] hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed text-[#040807] font-semibold text-sm shadow-[0_0_24px_rgba(16,185,129,0.3)] transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving 3-Deal Audit Request…
                    </>
                  ) : (
                    <>Submit 3 Deals for Async Written Audit &rarr;</>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400 text-center">
                  <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>
                    Encrypted async review · Direct email delivery via{' '}
                    {AUDIT_DESK_EMAIL}
                  </span>
                </div>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
