'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, FileWarning, Handshake, Scissors } from 'lucide-react';
import {
  GlassSpotlightCard,
  MagneticButton,
  ParallaxPhoto,
  ScrollReveal,
} from '@/components/landing/MotionPrimitives';

const LEAKAGE_CARDS = [
  {
    id: 'split-drift',
    title: 'Split Drift',
    stat: '$950 – $2,400 / deal',
    description:
      'Agents remain on post-cap 90/10 or legacy tiers after anniversary resets, silently overpaying every closed side.',
    image: '/images/coverage-split-ledger.jpg',
    alt: 'Commission split ledger and brokerage worksheet',
    icon: Scissors,
  },
  {
    id: 'uncollected-referrals',
    title: 'Uncollected Referrals',
    stat: '20% – 35% of side GCI',
    description:
      'Outbound partner and relocation referral agreements close without ever hitting your brokerage accounts receivable.',
    image: '/images/coverage-referral-handshake.jpg',
    alt: 'Managing brokers finalizing a real estate referral agreement',
    icon: Handshake,
  },
  {
    id: 'waived-fees',
    title: 'Waived Fees',
    stat: '$395 – $695 / side',
    description:
      'Compliance, E&O, and transaction fees get dropped at closing with no broker sign-off or ledger trace.',
    image: '/images/coverage-alta-document.jpg',
    alt: 'Real estate closing disclosure and ALTA settlement document',
    icon: FileWarning,
  },
] as const;

export default function ProblemSection({
  onScrollToTool,
  onRequestAudit,
}: {
  onScrollToTool: () => void;
  onRequestAudit: () => void;
}) {
  return (
    <section
      id="problem"
      className="relative border-y border-emerald-500/10 bg-[#0A0F0D]/80 py-20 sm:py-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Emotional Headline + Copy + CTA */}
          <ScrollReveal className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="text-xs font-medium text-emerald-300/90">
              The Hidden Brokerage Margin Drain
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.03em] leading-[1.08] text-white [text-wrap:balance]">
              You Don&apos;t Have a Volume Problem.{' '}
              <span className="text-[#34D399]">
                You Have a Leakage Problem.
              </span>
            </h2>

            <p className="text-base text-[#9CA3AF] leading-relaxed">
              Your agents are closing homes, yet net brokerage profit keeps
              shrinking. Between manual SkySlope exports, unverified Closing
              Disclosures, and hurried ACH payouts, the average 20–80 agent US
              brokerage quietly leaks{' '}
              <span className="text-white font-semibold">2.5% to 4.2% of GCI</span>{' '}
              every single quarter—without a single alert from accounting.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <MagneticButton>
                <button
                  type="button"
                  onClick={onScrollToTool}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#050807] font-semibold text-sm h-12 px-6 shadow-[0_0_32px_rgba(16,185,129,0.34)] transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap"
                >
                  Calculate Your Quarterly Leakage
                  <ArrowRight className="w-4 h-4" />
                </button>
              </MagneticButton>
              <button
                type="button"
                onClick={onRequestAudit}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#050807]/70 border border-emerald-500/25 hover:border-emerald-400/50 text-slate-200 hover:text-white font-medium text-sm h-12 px-5 transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap"
              >
                Free 3-Deal Audit
              </button>
            </div>
          </ScrollReveal>

          {/* Right Column: Large Brokerage Team Photo + 3 Glass Cards with Small Photos */}
          <div className="lg:col-span-7 space-y-6">
            <ScrollReveal delay={0.08}>
              <div className="relative rounded-[20px] overflow-hidden border border-emerald-500/20 shadow-[0_24px_60px_rgba(0,0,0,0.55),0_0_36px_rgba(16,185,129,0.1)] aspect-[16/9]">
                <ParallaxPhoto
                  src="/images/problem-brokerage-team.jpg"
                  alt="Brokerage leadership team reviewing commission spreadsheets in a modern glass office"
                  className="w-full h-full"
                  imgClassName="object-center"
                  sizes="(max-width: 1024px) 100vw, 720px"
                  strength={20}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050807]/85 via-[#050807]/20 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-wrap items-end justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-emerald-300">
                      Every Unaudited Closing Cycle
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-white">
                      Manual spreadsheet checks miss 1 in 6 payout discrepancies.
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#9CA3AF]">Typical Quarter Drain</div>
                    <div className="font-mono text-lg sm:text-xl font-bold text-rose-400 tabular-nums">
                      -$18k to -$61k
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* 3 Glass Cards: Split Drift, Uncollected Referrals, Waived Fees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {LEAKAGE_CARDS.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <ScrollReveal key={card.id} delay={0.12 + idx * 0.06}>
                    <GlassSpotlightCard className="h-full flex flex-col">
                      <div className="relative h-28 w-full overflow-hidden border-b border-emerald-500/15">
                        <Image
                          src={card.image}
                          alt={card.alt}
                          fill
                          sizes="(max-width: 640px) 100vw, 240px"
                          referrerPolicy="no-referrer"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-t from-[#0A110F] via-[#0A110F]/30 to-transparent"
                        />
                        <div className="absolute top-2.5 left-2.5 h-8 w-8 rounded-lg bg-[#050807]/85 backdrop-blur-md border border-emerald-500/30 flex items-center justify-center text-[#34D399]">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div className="space-y-1.5">
                          <h3 className="text-base font-bold text-white">
                            {card.title}
                          </h3>
                          <p className="text-xs text-[#9CA3AF] leading-relaxed">
                            {card.description}
                          </p>
                        </div>
                        <div className="pt-2.5 border-t border-white/[0.08] font-mono text-xs font-semibold text-rose-400 tabular-nums">
                          {card.stat}
                        </div>
                      </div>
                    </GlassSpotlightCard>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
