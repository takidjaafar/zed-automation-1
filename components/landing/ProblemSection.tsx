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
    image: '/images/candid/split-ledger.jpg',
    alt: 'Commission split ledger and brokerage worksheet',
    icon: Scissors,
  },
  {
    id: 'uncollected-referrals',
    title: 'Uncollected Referrals',
    stat: '20% – 35% of side GCI',
    description:
      'Outbound partner and relocation referral agreements close without ever hitting your brokerage accounts receivable.',
    image: '/images/candid/referral-handshake.jpg',
    alt: 'Managing brokers finalizing a real estate referral agreement',
    icon: Handshake,
  },
  {
    id: 'waived-fees',
    title: 'Waived Fees',
    stat: '$395 – $695 / side',
    description:
      'Compliance, E&O, and transaction fees get dropped at closing with no broker sign-off or ledger trace.',
    image: '/images/candid/alta-docs.jpg',
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
      className="relative border-y border-[#D8C8AE]/[0.1] bg-[#0A0F0D]/85 py-20 sm:py-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Emotional Headline + Copy + CTA */}
          <ScrollReveal className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="text-xs font-medium tracking-[0.04em] text-[#D8C8AE]">
              The Hidden Brokerage Margin Drain
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.1] text-[#F7F3EB] [text-wrap:balance]">
              You Don&apos;t Have a Volume Problem.{' '}
              <span className="italic font-medium text-[#D8C8AE]">
                You Have a Leakage Problem.
              </span>
            </h2>

            <p className="text-base text-[#B0ACA3] leading-[1.7] tracking-[0.01em]">
              Your agents are closing homes, yet net brokerage profit keeps
              shrinking. Between manual SkySlope exports, unverified Closing
              Disclosures, and hurried ACH payouts, the average 20–80 agent US
              brokerage quietly leaks{' '}
              <span className="text-[#F7F3EB] font-semibold">2.5% to 4.2% of GCI</span>{' '}
              every single quarter—without a single alert from accounting.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <MagneticButton>
                <button
                  type="button"
                  onClick={onScrollToTool}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B6B4A] hover:bg-[#117C57] text-[#F7F3EB] border border-[#D8C8AE]/20 font-semibold text-sm h-12 px-6 shadow-[0_10px_28px_rgba(0,0,0,0.45),0_4px_16px_rgba(11,107,74,0.28)] transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap"
                >
                  Calculate Your Quarterly Leakage
                  <ArrowRight className="w-4 h-4" />
                </button>
              </MagneticButton>
              <button
                type="button"
                onClick={onRequestAudit}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#060A08]/80 border border-[#D8C8AE]/20 hover:border-[#D8C8AE]/45 text-[#E8E2D6] hover:text-white font-medium text-sm h-12 px-5 transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap"
              >
                Free 3-Deal Audit
              </button>
            </div>
          </ScrollReveal>

          {/* Right Column: Large Brokerage Team Photo + 3 Glass Cards with Small Photos */}
          <div className="lg:col-span-7 space-y-6">
            <ScrollReveal delay={0.08}>
              <div className="relative rounded-[20px] overflow-hidden border border-[#D8C8AE]/18 shadow-[0_24px_60px_rgba(0,0,0,0.55)] aspect-[16/9]">
                <ParallaxPhoto
                  src="/images/candid/problem-team.jpg"
                  alt="Brokerage leadership team reviewing commission spreadsheets in a modern glass office"
                  className="w-full h-full"
                  imgClassName="object-center"
                  sizes="(max-width: 1024px) 100vw, 720px"
                  strength={20}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060A08]/88 via-[#060A08]/22 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-wrap items-end justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-[#D8C8AE]">
                      Every Unaudited Closing Cycle
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-[#F7F3EB]">
                      Manual spreadsheet checks miss 1 in 6 payout discrepancies.
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#A8A49B]">Typical Quarter Drain</div>
                    <div className="font-mono text-lg sm:text-xl font-semibold text-[#D98276] tabular-nums">
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
                      <div className="relative h-28 w-full overflow-hidden border-b border-[#D8C8AE]/12">
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
                          className="absolute inset-0 bg-gradient-to-t from-[#0B110F] via-[#0B110F]/30 to-transparent"
                        />
                        <div className="absolute top-2.5 left-2.5 h-8 w-8 rounded-lg bg-[#060A08]/85 backdrop-blur-md border border-[#D8C8AE]/25 flex items-center justify-center text-[#D8C8AE]">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div className="space-y-1.5">
                          <h3 className="text-base font-semibold text-[#F7F3EB]">
                            {card.title}
                          </h3>
                          <p className="text-xs text-[#B0ACA3] leading-[1.68] tracking-[0.01em]">
                            {card.description}
                          </p>
                        </div>
                        <div className="pt-2.5 border-t border-[#D8C8AE]/[0.1] font-mono text-xs font-semibold text-[#D98276] tabular-nums">
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
