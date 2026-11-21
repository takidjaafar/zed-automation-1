'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import {
  GlassSpotlightCard,
  ParallaxPhoto,
  ScrollReveal,
} from '@/components/landing/MotionPrimitives';

const MANUAL_WAY_POINTS = [
  'Slow manual re-keying of Closing Disclosures and Excel split tabs',
  'Missed anniversary cap resets and unbilled outbound referral checks',
  'Messy CRM exports scattered across SkySlope, Dotloop, and email threads',
  'Zero pre-payout audit trail before agent ACH wires leave the account',
] as const;

const ZED_WAY_POINTS = [
  '24/7 structured forensic reconciliation across every closed side',
  'Instant variance flags on split drift, ALTA fees, and referral receivables',
  'Clean accounting-ready CSV, Executive PDF Summary, and private Loom',
  '100% async written delivery in 48 hours—zero phone calls or Zoom',
] as const;

export default function ComparisonSection() {
  return (
    <section className="relative border-y border-[#D8C8AE]/[0.1] bg-[#0A0F0D]/85 py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal className="space-y-3 max-w-3xl">
          <div className="text-xs font-medium tracking-[0.04em] text-[#D8C8AE]">
            Operational Margin Comparison
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] leading-[1.08] text-[#F7F3EB] [text-wrap:balance]">
            Manual Spreadsheets Drain Margin.{' '}
            <span className="italic font-medium text-[#D8C8AE]">ZED Audits Async.</span>
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left Dull Panel: Manual Way */}
          <ScrollReveal>
            <GlassSpotlightCard
              variant="muted"
              shimmer={false}
              className="h-full flex flex-col justify-between opacity-90"
            >
              <div>
                <div className="relative h-60 w-full overflow-hidden border-b border-white/[0.08]">
                  <ParallaxPhoto
                    src="/images/candid/messy-desk.jpg"
                    alt="Messy brokerage desk stacked with closing folders, sticky notes, and manual spreadsheets"
                    className="w-full h-full"
                    imgClassName="grayscale-[18%] brightness-[1.14] sepia-[0.06]"
                    sizes="(max-width: 1024px) 100vw, 600px"
                    strength={14}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0F0E]/85 via-[#0B0F0E]/18 to-transparent"
                  />
                  <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                    <div>
                      <div className="text-xs font-medium text-[#D98276]">
                        Slow · Missed · Messy CRM
                      </div>
                      <h3 className="text-2xl font-semibold text-[#E8E2D6] mt-0.5">
                        Manual Way
                      </h3>
                    </div>
                  </div>
                </div>

                <ul className="p-6 space-y-4">
                  {MANUAL_WAY_POINTS.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-sm text-[#B0ACA3] leading-[1.68] tracking-[0.01em]"
                    >
                      <span className="mt-1 h-5 w-5 rounded-md bg-[#D98276]/12 border border-[#D98276]/25 flex items-center justify-center text-[#D98276] shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassSpotlightCard>
          </ScrollReveal>

          {/* Right Panel: ZED Way */}
          <ScrollReveal delay={0.08}>
            <GlassSpotlightCard
              borderBeam={true}
              className="h-full flex flex-col justify-between"
            >
              <div>
                <div className="relative h-60 w-full overflow-hidden border-b border-[#D8C8AE]/15">
                  <ParallaxPhoto
                    src="/images/candid/modern-team.jpg"
                    alt="Modern brokerage team collaborating cleanly in a bright architectural office"
                    className="w-full h-full"
                    sizes="(max-width: 1024px) 100vw, 600px"
                    strength={14}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B110F] via-[#0B110F]/30 to-transparent"
                  />
                  <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                    <div>
                      <div className="text-xs font-medium text-[#D8C8AE]">
                        24/7 · Instant · Clean · Async
                      </div>
                      <h3 className="text-2xl font-semibold text-[#F7F3EB] mt-0.5">
                        ZED Way
                      </h3>
                    </div>
                  </div>
                </div>

                <ul className="p-6 space-y-4">
                  {ZED_WAY_POINTS.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-sm text-[#E8E2D6] leading-[1.68] tracking-[0.01em]"
                    >
                      <span className="mt-1 h-5 w-5 rounded-md bg-[#0B6B4A]/30 border border-[#0B6B4A]/80 flex items-center justify-center text-[#58B38E] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassSpotlightCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
