'use client';

import React, { useState } from 'react';
import { ChevronDown, Lock, ShieldCheck } from 'lucide-react';
import {
  GlassSpotlightCard,
  ScrollReveal,
} from '@/components/landing/MotionPrimitives';
import {
  CONFIDENTIALITY_GUARANTEE_TEXT,
  EXECUTIVE_FAQ_ITEMS,
} from '@/lib/commission-audit/landing-proof';

export function ConfidentialityGuaranteeBar({
  onOpenPrivacy,
}: {
  onOpenPrivacy: () => void;
}) {
  return (
    <div className="rounded-2xl bg-[#050807]/75 border border-emerald-500/20 px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start sm:items-center gap-2.5 min-w-0">
        <ShieldCheck className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5 sm:mt-0" />
        <span className="text-xs text-slate-300 leading-relaxed">
          {CONFIDENTIALITY_GUARANTEE_TEXT}
        </span>
      </div>
      <button
        type="button"
        onClick={onOpenPrivacy}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#34D399] hover:text-emerald-200 underline decoration-emerald-400/40 underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-center"
      >
        <Lock className="w-3.5 h-3.5 shrink-0" />
        Privacy &amp; NDA Terms
      </button>
    </div>
  );
}

export function ExecutiveFaqSection() {
  const [openId, setOpenId] = useState<string | null>(
    EXECUTIVE_FAQ_ITEMS[0]?.id ?? null,
  );

  return (
    <section id="faq" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <ScrollReveal className="space-y-3 text-left sm:text-center">
          <div className="text-xs font-medium text-emerald-300/90">
            Executive FAQ · Managing Broker Answers
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] leading-[1.08] text-white [text-wrap:balance]">
            Common Questions Before{' '}
            <span className="text-[#34D399]">Sending 3 Deals</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <GlassSpotlightCard tilt={false} className="overflow-hidden">
            <div className="divide-y divide-white/[0.08]">
              {EXECUTIVE_FAQ_ITEMS.map((item, idx) => {
                const isOpen = openId === item.id;
                const panelId = `faq-panel-${item.id}`;
                const triggerId = `faq-trigger-${item.id}`;

                return (
                  <div key={item.id} className="transition-colors">
                    <button
                      id={triggerId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="w-full px-5 sm:px-7 py-5 sm:py-6 flex items-center justify-between gap-4 text-left hover:bg-emerald-500/[0.04] transition-colors cursor-pointer"
                    >
                      <div className="flex items-baseline gap-3.5 min-w-0">
                        <span className="font-mono text-xs font-semibold text-[#34D399] tabular-nums shrink-0">
                          0{idx + 1}
                        </span>
                        <span className="text-base font-semibold text-white leading-snug">
                          {item.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-[#34D399] shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={triggerId}
                        className="px-5 sm:px-7 pb-6 pl-12 sm:pl-16 text-sm text-[#9CA3AF] leading-relaxed"
                      >
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassSpotlightCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
