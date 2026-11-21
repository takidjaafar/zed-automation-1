'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import {
  AnimatedNumber,
  GlassSpotlightCard,
  ParallaxPhoto,
  ScrollReveal,
} from '@/components/landing/MotionPrimitives';
import {
  ANONYMIZED_AUDIT_SNAPSHOTS,
  formatSnapshotUsd,
} from '@/lib/commission-audit/landing-proof';

const SNAPSHOT_PHOTOS: Record<string, { src: string; alt: string }> = {
  'tx-residential-42': {
    src: '/images/candid/texas-owner.jpg',
    alt: 'Anonymized Texas residential brokerage owner in tailored suit in modern office',
  },
  'fl-coastal-28': {
    src: '/images/candid/florida-owner.jpg',
    alt: 'Anonymized Florida coastal real estate team managing broker in modern glass office',
  },
  'az-multi-office-65': {
    src: '/images/candid/arizona-owner.jpg',
    alt: 'Anonymized Arizona multi-office brokerage owner seated with city skyline view',
  },
};

export default function AuditSnapshotsSection({
  onOpenPrivacy,
}: {
  onOpenPrivacy: () => void;
}) {
  return (
    <section id="results" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-medium tracking-[0.04em] text-[#D8C8AE]">
              Verified 90-Day Ledger Recoveries
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] leading-[1.08] text-[#F7F3EB] [text-wrap:balance]">
              Real GCI Recovered.{' '}
              <span className="italic font-medium text-[#D8C8AE]">Anonymized Under NDA.</span>
            </h2>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 text-xs">
            <span className="text-[#D8C8AE] font-medium">
              All identities protected under mutual NDA.
            </span>
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="inline-flex items-center gap-1.5 text-[#A8A49B] hover:text-[#F7F3EB] underline decoration-[#D8C8AE]/40 underline-offset-4 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3 text-[#D8C8AE]" />
              Review Mutual NDA &amp; 48h Purge Terms
            </button>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {ANONYMIZED_AUDIT_SNAPSHOTS.map((snap, idx) => {
            const photo = SNAPSHOT_PHOTOS[snap.id] ?? {
              src: '/images/candid/texas-owner.jpg',
              alt: `${snap.brokerageProfile} anonymized brokerage owner`,
            };

            return (
              <ScrollReveal key={snap.id} delay={idx * 0.08}>
                <GlassSpotlightCard className="h-full flex flex-col justify-between overflow-hidden">
                  <div>
                    {/* Editorial Owner Portrait Header with Subtle Parallax */}
                    <div className="relative h-56 w-full overflow-hidden border-b border-[#D8C8AE]/14">
                      <ParallaxPhoto
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-full"
                        imgClassName="object-top"
                        sizes="(max-width: 1024px) 100vw, 400px"
                        strength={14}
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B110F] via-[#0B110F]/40 to-transparent"
                      />
                      <div className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-medium text-[#D8C8AE]">
                            {snap.fileCode} · {snap.reviewWindow}
                          </div>
                          <h3 className="text-lg font-semibold text-[#F7F3EB] leading-tight mt-0.5">
                            {snap.brokerageProfile}
                          </h3>
                          <div className="text-xs text-[#D4D0C8] mt-0.5">
                            <span className="font-mono tabular-nums">
                              {snap.agentCount}
                            </span>{' '}
                            Agents ·{' '}
                            <span className="font-mono tabular-nums">
                              {snap.closedSides}
                            </span>{' '}
                            Closed Sides
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recovered Headline Figure + Exact Breakdown */}
                    <div className="p-5 sm:p-6 space-y-5">
                      <div className="flex items-baseline justify-between gap-2 pb-4 border-b border-[#D8C8AE]/[0.1]">
                        <span className="text-xs font-medium text-[#A8A49B]">
                          Total Leakage Recovered
                        </span>
                        <span className="font-mono text-2xl sm:text-3xl font-semibold text-[#58B38E]">
                          <AnimatedNumber
                            value={snap.totalRecovered}
                            prefix="+$"
                          />
                        </span>
                      </div>

                      <div className="divide-y divide-white/[0.06] text-xs">
                        <div className="py-2.5 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-[#F7F3EB]">
                              Split Drift
                            </div>
                            <div className="text-[11px] text-[#A8A49B]">
                              {snap.splitDriftNote}
                            </div>
                          </div>
                          <span className="font-mono font-semibold text-[#F7F3EB] tabular-nums shrink-0">
                            {formatSnapshotUsd(snap.splitDrift)}
                          </span>
                        </div>

                        <div className="py-2.5 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-[#F7F3EB]">
                              Uncollected Referrals
                            </div>
                            <div className="text-[11px] text-[#A8A49B]">
                              {snap.uncollectedReferralsNote}
                            </div>
                          </div>
                          <span className="font-mono font-semibold text-[#F7F3EB] tabular-nums shrink-0">
                            {formatSnapshotUsd(snap.uncollectedReferrals)}
                          </span>
                        </div>

                        <div className="py-2.5 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-[#F7F3EB]">
                              Waived Admin Fees
                            </div>
                            <div className="text-[11px] text-[#A8A49B]">
                              {snap.waivedAdminFeesNote}
                            </div>
                          </div>
                          <span className="font-mono font-semibold text-[#F7F3EB] tabular-nums shrink-0">
                            {formatSnapshotUsd(snap.waivedAdminFees)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NDA Confidentiality Footer */}
                  <div className="px-5 sm:px-6 py-3.5 border-t border-[#D8C8AE]/[0.1] bg-[#060A08]/65 flex items-center gap-2 text-[11px] text-[#A8A49B]">
                    <Lock className="w-3.5 h-3.5 text-[#D8C8AE] shrink-0" />
                    <span>{snap.ndaNotice}</span>
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
