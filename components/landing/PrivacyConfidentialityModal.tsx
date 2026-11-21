'use client';

import React from 'react';
import {
  FileKey2,
  Lock,
  Mail,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AUDIT_DESK_EMAIL } from '@/lib/commission-audit/audit-intake';

export interface PrivacyConfidentialityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PROTOCOL_GUARANTEES = [
  {
    icon: ShieldCheck,
    title: 'Strict Mutual NDA Coverage',
    detail:
      'Every brokerage ledger, Closing Disclosure, and commission split schedule submitted to Zed Automation is governed by mutual non-disclosure terms. Brokerage names, agent rosters, and deal parties are never disclosed, resold, or shared outside the audit desk.',
  },
  {
    icon: FileKey2,
    title: 'Zero Bank, Accounting, or MLS Logins',
    detail:
      'We never ask for bank credentials, QuickBooks passwords, brokerage ERP access, or MLS logins. Every 3-deal diagnostic runs strictly from closed settlement summaries or redacted Closing Disclosures you choose to share.',
  },
  {
    icon: Trash2,
    title: 'Automatic 48-Hour Source File Purge',
    detail:
      'All submitted settlement summaries and transaction notes are stored in an isolated workspace strictly for reconciliation and are permanently purged within 48 hours of delivering your final CSV, Executive PDF Summary, and private Loom walkthrough.',
  },
] as const;

export default function PrivacyConfidentialityModal({
  open,
  onOpenChange,
}: PrivacyConfidentialityModalProps) {
  const ndaMailto = `mailto:${AUDIT_DESK_EMAIL}?subject=${encodeURIComponent(
    'Mutual NDA Request — Zed Automation 3-Deal Commission Audit',
  )}&body=${encodeURIComponent(
    'Hello Zed Audit Desk,\n\nPlease send a countersigned copy of your Mutual NDA prior to our 3-deal written commission audit submission.\n\nBrokerage Name:\nManaging Broker Name:\n',
  )}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-[#0A110F]/95 backdrop-blur-2xl text-slate-100 border border-white/[0.09] border-t-emerald-400/30 shadow-[0_24px_70px_rgba(0,0,0,0.65)] p-0 gap-0">
        <DialogHeader className="px-5 sm:px-6 pt-6 pb-5 border-b border-white/[0.08] text-left space-y-2">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-emerald-300/90">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            Confidentiality &amp; Zero-Access Protocol
          </div>
          <DialogTitle className="font-display text-xl font-bold tracking-[-0.03em] text-white">
            Brokerage Data Privacy &amp; Mutual NDA Terms
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-300 leading-relaxed">
            Built for US managing brokers who require institutional-grade
            discretion when auditing closed commission files.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="divide-y divide-white/[0.07] rounded-xl bg-[#040807]/85 border border-white/[0.08]">
            {PROTOCOL_GUARANTEES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="p-4 flex items-start gap-3.5">
                  <div className="h-8 w-8 rounded-lg bg-[#0A110F] border border-white/[0.09] border-t-emerald-400/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl bg-[#040807]/90 border border-white/[0.08] border-t-emerald-400/20 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <div className="text-xs font-semibold text-white">
                Need a countersigned Mutual NDA PDF first?
              </div>
              <div className="text-[11px] text-slate-400 break-words">
                Written delivery via {AUDIT_DESK_EMAIL}
              </div>
            </div>
            <a
              href={ndaMailto}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#0A110F] hover:bg-white/[0.04] border border-white/[0.12] hover:border-emerald-400/35 text-emerald-300 hover:text-emerald-200 text-xs font-semibold transition-all active:scale-[0.985] whitespace-nowrap shrink-0"
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              Request NDA Copy
            </a>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
            <span className="text-[11px] text-slate-400">
              Zero phone calls · Written audit desk only
            </span>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
