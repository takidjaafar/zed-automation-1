'use client';

import React, { useCallback, useRef, useState } from 'react';
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
import {
  clampCarouselIndex,
  computeActiveCarouselIndex,
} from '@/lib/commission-audit/carousel';

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
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const baseOffset = itemRefs.current[0]?.offsetLeft ?? 0;
    const offsets = itemRefs.current.map((el) =>
      el ? Math.max(0, el.offsetLeft - baseOffset) : 0,
    );
    setActiveIndex(computeActiveCarouselIndex(track.scrollLeft, offsets));
  }, []);

  const scrollToCard = useCallback((index: number) => {
    const clamped = clampCarouselIndex(index, ANONYMIZED_AUDIT_SNAPSHOTS.length);
    const track = trackRef.current;
    const target = itemRefs.current[clamped];
    const baseOffset = itemRefs.current[0]?.offsetLeft ?? 0;
    if (track && target) {
      track.scrollTo({
        left: Math.max(0, target.offsetLeft - baseOffset),
        behavior: 'smooth',
      });
      setActiveIndex(clamped);
    }
  }, []);

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
            <p className="text-xs sm:text-[13px] text-[#A8A49B] leading-[1.6]">
              Illustrative examples based on common leakage patterns. Client
              identities protected under mutual NDA.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 text-xs">
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="inline-flex items-center gap-1.5 text-[#D8C8AE] hover:text-[#F7F3EB] underline decoration-[#D8C8AE]/40 underline-offset-4 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3 text-[#D8C8AE]" />
              Review Mutual NDA &amp; 48h Purge Terms
            </button>
          </div>
        </ScrollReveal>

        <div>
          <div
            ref={trackRef}
            onScroll={handleScroll}
            data-testid="snapshots-carousel"
            className="flex lg:grid lg:grid-cols-3 gap-4 lg:gap-6 items-stretch overflow-x-auto lg:overflow-visible snap-x snap-mandatory scroll-smooth -mx-4 px-4 pb-2 lg:mx-0 lg:px-0 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {ANONYMIZED_AUDIT_SNAPSHOTS.map((snap, idx) => {
              const photo = SNAPSHOT_PHOTOS[snap.id] ?? {
                src: '/images/candid/texas-owner.jpg',
                alt: `${snap.brokerageProfile} anonymized brokerage owner`,
              };

              return (
                <div
                  key={snap.id}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  className="w-[calc(100%-1.5rem)] max-w-[360px] shrink-0 snap-center lg:w-auto lg:max-w-none lg:shrink"
                >
                  <ScrollReveal delay={idx * 0.08} className="h-full">
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
                              <div className="text-xs font-medium text-[#D8C8AE]">
                                {snap.fileCode} · {snap.reviewWindow}
                              </div>
                              <h3 className="text-lg font-semibold text-[#F7F3EB] leading-tight mt-0.5">
                                {snap.brokerageProfile}
                              </h3>
                              <div className="text-[13px] text-[#D4D0C8] mt-0.5">
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
                            <span className="text-[13px] font-medium text-[#A8A49B]">
                              Total Leakage Recovered
                            </span>
                            <span className="font-mono text-2xl sm:text-3xl font-semibold text-[#58B38E]">
                              <AnimatedNumber
                                value={snap.totalRecovered}
                                prefix="+$"
                              />
                            </span>
                          </div>

                          <div className="divide-y divide-white/[0.06] text-[14px] leading-[1.6]">
                            <div className="py-3 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-medium text-[#F7F3EB]">
                                  Split Drift
                                </div>
                                <div className="text-[13px] text-[#B8B4AB] leading-[1.6]">
                                  {snap.splitDriftNote}
                                </div>
                              </div>
                              <span className="font-mono font-semibold text-[#F7F3EB] tabular-nums shrink-0">
                                {formatSnapshotUsd(snap.splitDrift)}
                              </span>
                            </div>

                            <div className="py-3 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-medium text-[#F7F3EB]">
                                  Uncollected Referrals
                                </div>
                                <div className="text-[13px] text-[#B8B4AB] leading-[1.6]">
                                  {snap.uncollectedReferralsNote}
                                </div>
                              </div>
                              <span className="font-mono font-semibold text-[#F7F3EB] tabular-nums shrink-0">
                                {formatSnapshotUsd(snap.uncollectedReferrals)}
                              </span>
                            </div>

                            <div className="py-3 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-medium text-[#F7F3EB]">
                                  Waived Admin Fees
                                </div>
                                <div className="text-[13px] text-[#B8B4AB] leading-[1.6]">
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
                      <div className="px-5 sm:px-6 py-3.5 border-t border-[#D8C8AE]/[0.1] bg-[#060A08]/65 flex items-center gap-2 text-xs text-[#A8A49B] leading-[1.6]">
                        <Lock className="w-3.5 h-3.5 text-[#D8C8AE] shrink-0" />
                        <span>{snap.ndaNotice}</span>
                      </div>
                    </GlassSpotlightCard>
                  </ScrollReveal>
                </div>
              );
            })}
          </div>

          {/* Mobile-only Manual Carousel Dots Indicator */}
          <div
            data-testid="snapshots-carousel-dots"
            role="tablist"
            aria-label="Audit snapshots"
            className="mt-4 flex lg:hidden items-center justify-center gap-2"
          >
            {ANONYMIZED_AUDIT_SNAPSHOTS.map((snap, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={snap.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`View ${snap.brokerageProfile}`}
                  onClick={() => scrollToCard(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    isActive
                      ? 'w-5 bg-[#D8C8AE]'
                      : 'w-2 bg-[#D8C8AE]/30 hover:bg-[#D8C8AE]/50'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
