'use client';

import React from 'react';
import {
  FileSpreadsheet,
  FileText,
  Lock,
  MailCheck,
  ShieldCheck,
  Video,
} from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  GlassSpotlightCard,
  ScrollReveal,
} from '@/components/landing/MotionPrimitives';
import {
  CONFIDENTIALITY_GUARANTEE_TEXT,
  DELIVERABLE_DOSSIER_ITEMS,
  EXECUTIVE_FAQ_ITEMS,
} from '@/lib/commission-audit/landing-proof';

const DELIVERABLE_ICONS = {
  csv: FileSpreadsheet,
  pdf: FileText,
  loom: Video,
} as const;

export function AuditDossierPreviewCard() {
  return (
    <ScrollReveal delay={0.04}>
      <GlassSpotlightCard
        variant="emerald"
        tilt={false}
        className="overflow-hidden"
      >
        {/* Top Dossier Header Bar */}
        <div className="px-5 sm:px-7 py-4 border-b border-white/[0.08] bg-[#060C0A]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/12 border border-white/[0.1] border-t-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <MailCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-semibold tracking-[-0.02em] text-white">
                Sample 48-Hour Audit Dossier
              </h3>
              <p className="text-xs text-slate-400">
                Exact 3 confidential deliverables sent directly to your work
                inbox
              </p>
            </div>
          </div>

          <div className="text-xs font-medium text-emerald-300/90 sm:text-right">
            Inbox Delivery · <span className="font-mono tabular-nums">48h</span> SLA · Zero Meetings
          </div>
        </div>

        {/* 3 Exact Deliverables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
          {DELIVERABLE_DOSSIER_ITEMS.map((item) => {
            const Icon = DELIVERABLE_ICONS[item.id];
            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-2 text-emerald-400 font-semibold">
                      <Icon className="w-4 h-4 shrink-0" />
                      Deliverable <span className="font-mono tabular-nums">{item.step}</span>
                    </span>
                    <span className="text-slate-400 truncate">
                      {item.formatLabel}
                    </span>
                  </div>

                  <h4 className="text-base font-semibold tracking-[-0.02em] text-white">
                    {item.title}
                  </h4>

                  <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Clean Tabular Spec Footer */}
                <div className="pt-3.5 border-t border-white/[0.08] space-y-2 text-xs">
                  {item.previewMeta.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-2 min-w-0"
                    >
                      <span className="text-slate-400 shrink-0">
                        {row.label}
                      </span>
                      <span className="text-slate-200 font-medium text-right truncate">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GlassSpotlightCard>
    </ScrollReveal>
  );
}

export function ConfidentialityGuaranteeBar({
  onOpenPrivacy,
}: {
  onOpenPrivacy: () => void;
}) {
  return (
    <div className="relative z-30 px-5 sm:px-7 py-3.5 border-t border-white/[0.08] bg-[#040807]/90 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div className="flex items-start sm:items-center gap-2.5 text-xs font-medium text-slate-200 min-w-0">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
        <span className="leading-relaxed">
          {CONFIDENTIALITY_GUARANTEE_TEXT}
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenPrivacy}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 hover:text-emerald-200 underline underline-offset-4 decoration-emerald-400/40 hover:decoration-emerald-300 transition-colors cursor-pointer self-start lg:self-auto whitespace-nowrap shrink-0"
      >
        <Lock className="w-3.5 h-3.5 shrink-0" />
        Privacy &amp; Confidentiality
      </button>
    </div>
  );
}

export function ExecutiveFaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 space-y-8">
      <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-400">
            Section 06 · Managing Broker Objections
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.03em] text-white [text-wrap:balance]">
            Executive <span className="text-emerald-400">Audit FAQ</span>
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          Direct written answers · Zero sales friction
        </span>
      </ScrollReveal>

      <ScrollReveal delay={0.08}>
        <GlassSpotlightCard tilt={false} className="overflow-hidden">
          <Accordion
            type="single"
            collapsible
            defaultValue={EXECUTIVE_FAQ_ITEMS[0].id}
            className="divide-y divide-white/[0.08]"
          >
            {EXECUTIVE_FAQ_ITEMS.map((item, index) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-b-0 px-5 sm:px-7"
              >
                <AccordionTrigger className="py-5 text-left text-sm sm:text-base font-semibold text-white hover:text-emerald-300 hover:no-underline gap-4 cursor-pointer [&>svg]:text-emerald-400">
                  <span className="flex items-baseline gap-3 min-w-0">
                    <span className="text-xs font-mono text-emerald-400/80 tabular-nums shrink-0">
                      0{index + 1}
                    </span>
                    <span className="text-left leading-snug">
                      {item.question}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 pl-0 sm:pl-7 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </GlassSpotlightCard>
      </ScrollReveal>
    </section>
  );
}
