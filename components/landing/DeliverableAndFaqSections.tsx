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
    <div className="rounded-2xl bg-[#060A08]/80 border border-[#D8C8AE]/16 px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start sm:items-center gap-2.5 min-w-0">
        <ShieldCheck className="w-4 h-4 text-[#58B38E] shrink-0 mt-0.5 sm:mt-0" />
        <span className="text-xs text-[#D4D0C8] leading-[1.68]">
          {CONFIDENTIALITY_GUARANTEE_TEXT}
        </span>
      </div>
      <button
        type="button"
        onClick={onOpenPrivacy}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D8C8AE] hover:text-[#F7F3EB] underline decoration-[#D8C8AE]/40 underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-center"
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
          <div className="text-xs font-medium tracking-[0.04em] text-[#D8C8AE]">
            Executive FAQ · Managing Broker Answers
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] leading-[1.08] text-[#F7F3EB] [text-wrap:balance]">
            Common Questions Before{' '}
            <span className="italic font-medium text-[#D8C8AE]">Sending 3 Deals</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <GlassSpotlightCard tilt={false} className="overflow-hidden">
            <div className="divide-y divide-[#D8C8AE]/[0.1]">
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
                      className="w-full px-5 sm:px-7 py-5 sm:py-6 flex items-center justify-between gap-4 text-left hover:bg-[#D8C8AE]/[0.03] transition-colors cursor-pointer"
                    >
                      <div className="flex items-baseline gap-3.5 min-w-0">
                        <span className="font-mono text-xs font-semibold text-[#D8C8AE] tabular-nums shrink-0">
                          0{idx + 1}
                        </span>
                        <span className="text-base font-semibold text-[#F7F3EB] leading-snug">
                          {item.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-[#D8C8AE] shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={triggerId}
                        className="px-5 sm:px-7 pb-6 pl-12 sm:pl-16 text-sm text-[#B0ACA3] leading-[1.7] tracking-[0.01em]"
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
