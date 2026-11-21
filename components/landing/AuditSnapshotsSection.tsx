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
    src: '/images/broker-1.jpg',
    alt: 'Anonymized Texas residential brokerage owner in tailored suit in modern office',
  },
  'fl-coastal-28': {
    src: '/images/broker-2.jpg',
    alt: 'Anonymized Florida coastal real estate team managing broker in modern glass office',
  },
  'az-multi-office-65': {
    src: '/images/broker-3.jpg',
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
            <div className="text-xs font-medium text-emerald-300/90">
              Verified 90-Day Ledger Recoveries
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] leading-[1.06] text-white [text-wrap:balance]">
              Real GCI Recovered.{' '}
              <span className="text-[#34D399]">Anonymized Under NDA.</span>
            </h2>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 text-xs">
            <span className="text-emerald-300 font-medium">
              All identities protected under mutual NDA.
            </span>
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="inline-flex items-center gap-1.5 text-[#9CA3AF] hover:text-white underline decoration-emerald-500/40 underline-offset-4 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3 text-[#34D399]" />
              Review Mutual NDA &amp; 48h Purge Terms
            </button>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {ANONYMIZED_AUDIT_SNAPSHOTS.map((snap, idx) => {
            const photo = SNAPSHOT_PHOTOS[snap.id] ?? {
              src: '/images/broker-1.jpg',
              alt: `${snap.brokerageProfile} anonymized brokerage owner`,
            };

            return (
              <ScrollReveal key={snap.id} delay={idx * 0.08}>
                <GlassSpotlightCard className="h-full flex flex-col justify-between overflow-hidden">
                  <div>
                    {/* Editorial Owner Portrait Header with Subtle Parallax */}
                    <div className="relative h-56 w-full overflow-hidden border-b border-emerald-500/15">
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
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A110F] via-[#0A110F]/40 to-transparent"
                      />
                      <div className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-medium text-emerald-300">
                            {snap.fileCode} · {snap.reviewWindow}
                          </div>
                          <h3 className="text-lg font-bold text-white leading-tight mt-0.5">
                            {snap.brokerageProfile}
                          </h3>
                          <div className="text-xs text-slate-300 mt-0.5">
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
                      <div className="flex items-baseline justify-between gap-2 pb-4 border-b border-white/[0.08]">
                        <span className="text-xs font-medium text-[#9CA3AF]">
                          Total Leakage Recovered
                        </span>
                        <span className="font-mono text-2xl sm:text-3xl font-bold text-[#34D399] drop-shadow-[0_0_16px_rgba(16,185,129,0.35)]">
                          <AnimatedNumber
                            value={snap.totalRecovered}
                            prefix="+$"
                          />
                        </span>
                      </div>

                      <div className="divide-y divide-white/[0.06] text-xs">
                        <div className="py-2.5 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-white">
                              Split Drift
                            </div>
                            <div className="text-[11px] text-[#9CA3AF]">
                              {snap.splitDriftNote}
                            </div>
                          </div>
                          <span className="font-mono font-semibold text-white tabular-nums shrink-0">
                            {formatSnapshotUsd(snap.splitDrift)}
                          </span>
                        </div>

                        <div className="py-2.5 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-white">
                              Uncollected Referrals
                            </div>
                            <div className="text-[11px] text-[#9CA3AF]">
                              {snap.uncollectedReferralsNote}
                            </div>
                          </div>
                          <span className="font-mono font-semibold text-white tabular-nums shrink-0">
                            {formatSnapshotUsd(snap.uncollectedReferrals)}
                          </span>
                        </div>

                        <div className="py-2.5 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-white">
                              Waived Admin Fees
                            </div>
                            <div className="text-[11px] text-[#9CA3AF]">
                              {snap.waivedAdminFeesNote}
                            </div>
                          </div>
                          <span className="font-mono font-semibold text-white tabular-nums shrink-0">
                            {formatSnapshotUsd(snap.waivedAdminFees)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NDA Confidentiality Footer */}
                  <div className="px-5 sm:px-6 py-3.5 border-t border-white/[0.08] bg-[#050807]/60 flex items-center gap-2 text-[11px] text-[#9CA3AF]">
                    <Lock className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
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
