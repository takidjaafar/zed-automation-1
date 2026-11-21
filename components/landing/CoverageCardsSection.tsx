'use client';

import React from 'react';
import Image from 'next/image';
import {
  FileCheck2,
  Handshake,
  Layers,
  Scale,
} from 'lucide-react';
import {
  GlassSpotlightCard,
  ScrollReveal,
} from '@/components/landing/MotionPrimitives';

const COVERAGE_CARDS = [
  {
    id: 'split-cap-drift',
    title: 'Agent Split & Cap Drift',
    impact: '$950–$2,400 / deal',
    source: 'Closing Disclosure + Cap Ledger',
    detail:
      'Verifies anniversary reset dates, sliding commission tiers, and post-cap transitions against every agent agreement before payouts finalize.',
    image: '/images/candid/split-ledger.jpg',
    alt: 'Commission split ledger and financial reconciliation worksheet',
    icon: Scale,
  },
  {
    id: 'uncollected-referrals',
    title: 'Uncollected Referral Fees',
    impact: '20%–35% of side GCI',
    source: 'Referral Agreements',
    detail:
      'Cross-checks outbound partner, relocation, and corporate referral agreements against settled closing statements so receivables never vanish.',
    image: '/images/candid/referral-handshake.jpg',
    alt: 'Managing brokers completing a real estate referral handshake',
    icon: Handshake,
  },
  {
    id: 'admin-compliance-fees',
    title: 'Admin & Compliance Fees',
    impact: '$395–$695 / side',
    source: 'HUD-1 / ALTA Statement',
    detail:
      'Flags undocumented transaction coordinator, broker compliance, and admin fee waivers omitted on final HUD-1 and ALTA statements.',
    image: '/images/candid/alta-docs.jpg',
    alt: 'HUD-1 and ALTA real estate settlement documents on executive desk',
    icon: FileCheck2,
  },
  {
    id: 'team-overrides-eo',
    title: 'Team Overrides & E&O',
    impact: '$420–$1,350 / deal',
    source: 'ALTA Ledger',
    detail:
      'Audits multi-tier team leader overrides, mentorship splits, and per-side E&O insurance deductions line-by-line across every office.',
    image: '/images/candid/override-laptop.jpg',
    alt: 'Financial override analytics dashboard with emerald recovery chart',
    icon: Layers,
  },
] as const;

export default function CoverageCardsSection() {
  return (
    <section
      id="protocol"
      className="relative scroll-mt-20 border-y border-[#D8C8AE]/[0.1] bg-[#0A0F0D]/85 py-20 sm:py-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-medium tracking-[0.04em] text-[#D8C8AE]">
              Four-Point Forensic Reconciliation
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] leading-[1.08] text-[#F7F3EB] [text-wrap:balance]">
              Commission &amp; Closing{' '}
              <span className="italic font-medium text-[#D8C8AE]">Audit Protocol</span>
            </h2>
          </div>
          <p className="text-sm text-[#B0ACA3] max-w-md leading-[1.7] tracking-[0.01em]">
            Every closed transaction passes through four structured forensic
            checks—verified directly against source agreements and ALTA
            settlement statements.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {COVERAGE_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <ScrollReveal key={card.id} delay={idx * 0.06}>
                <GlassSpotlightCard className="h-full p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-stretch">
                  {/* Small Editorial Photo Thumbnail */}
                  <div className="relative w-full sm:w-44 h-48 sm:h-auto sm:min-h-[208px] sm:self-stretch shrink-0 rounded-2xl overflow-hidden border border-[#D8C8AE]/18">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, 180px"
                      referrerPolicy="no-referrer"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#060A08]/70 via-transparent to-transparent"
                    />
                    <div className="absolute top-3 left-3 h-9 w-9 rounded-xl bg-[#060A08]/85 backdrop-blur-md border border-[#D8C8AE]/25 flex items-center justify-center text-[#D8C8AE]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="flex-1 flex flex-col justify-between gap-4 min-w-0">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold tracking-[-0.015em] text-[#F7F3EB]">
                        {card.title}
                      </h3>
                      <p className="text-sm text-[#B0ACA3] leading-[1.68] tracking-[0.01em]">
                        {card.detail}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#D8C8AE]/[0.1] grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-[11px] text-[#A8A49B]">
                          Typical Leakage
                        </div>
                        <div className="mt-0.5 font-mono text-sm font-semibold text-[#58B38E] tabular-nums">
                          {card.impact}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#A8A49B]">
                          Verification Source
                        </div>
                        <div className="mt-0.5 text-xs font-medium text-[#F7F3EB]">
                          {card.source}
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassSpotlightCard>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
