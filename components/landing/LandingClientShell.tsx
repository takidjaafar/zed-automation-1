'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import AtmosphericBackdrop from '@/components/landing/AtmosphericBackdrop';
import ProblemSection from '@/components/landing/ProblemSection';
import LeakageAuditTool from '@/components/landing/LeakageAuditTool';
import CoverageCardsSection from '@/components/landing/CoverageCardsSection';
import AuditSnapshotsSection from '@/components/landing/AuditSnapshotsSection';
import ComparisonSection from '@/components/landing/ComparisonSection';
import {
  ConfidentialityGuaranteeBar,
  ExecutiveFaqSection,
} from '@/components/landing/DeliverableAndFaqSections';
import {
  AnimatedNumber,
  GlassSpotlightCard,
  MagneticButton,
  ParallaxPhoto,
  ScrollReveal,
  TrustMarquee,
} from '@/components/landing/MotionPrimitives';
import PrivacyConfidentialityModal from '@/components/landing/PrivacyConfidentialityModal';
import WrittenAuditModal from '@/components/landing/WrittenAuditModal';

export default function LandingClientShell() {
  const [modalOpen, setModalOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [prefilledNotes, setPrefilledNotes] = useState('');

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleOpenModalWithNote = (note: string) => {
    setPrefilledNotes(note);
    setModalOpen(true);
  };

  const handleScrollToTool = () => {
    const el = document.getElementById('tool');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060A08] text-[#F5F2EB] flex flex-col overflow-x-clip">
      <AtmosphericBackdrop />

      {/* 1. FIXED GLASS NAVBAR (3-Zone Top Bar Contract) */}
      <header className="sticky top-0 z-40 border-b border-[#D8C8AE]/[0.12] bg-[#060A08]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Brand Zone */}
          <Link href="/" className="flex items-center gap-3 min-w-0 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-[#0B110F] border border-[#D8C8AE]/25 flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src="/assets/aistudio/ZED_SVG_e2b1063b.svg"
                alt="ZED Automation logo"
                width={32}
                height={32}
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="font-[family-name:var(--font-display)] text-sm sm:text-base font-semibold tracking-[0.02em] text-[#F5F2EB] whitespace-nowrap shrink-0">
              ZED AUTOMATION
            </span>
          </Link>

          {/* Center Nav Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A8A49B]"
          >
            <a
              href="#tool"
              className="hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0"
            >
              Tool
            </a>
            <a
              href="#results"
              className="hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0"
            >
              Results
            </a>
            <a
              href="#protocol"
              className="hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0"
            >
              Protocol
            </a>
            <a
              href="#faq"
              className="hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0"
            >
              FAQ
            </a>
          </nav>

          {/* Primary Action */}
          <div className="flex items-center shrink-0">
            <MagneticButton>
              <button
                type="button"
                onClick={handleOpenModal}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0B6B4A] hover:bg-[#117C57] text-[#F7F3EB] border border-[#D8C8AE]/20 px-4 sm:px-5 h-10 text-xs sm:text-sm font-semibold shadow-[0_8px_22px_rgba(0,0,0,0.4),0_2px_12px_rgba(11,107,74,0.28)] transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap shrink-0"
              >
                Request Written Audit
              </button>
            </MagneticButton>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {/* 2. HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left Copy & Conversion Column */}
            <ScrollReveal
              aboveFold={true}
              className="lg:col-span-6 flex flex-col justify-center space-y-7"
            >
              <div className="text-xs font-medium tracking-[0.04em] text-[#D8C8AE]">
                Forensic GCI Verification · 48h PDF + Loom · 100% Written, Zero Calls
              </div>

              <div className="space-y-4">
                <h1 className="text-[clamp(2.35rem,4.2vw,3.75rem)] font-semibold tracking-[-0.02em] leading-[1.08] text-[#F7F3EB] [text-wrap:balance]">
                  Stop Leaking Commissions.{' '}
                  <span className="italic font-medium text-[#D8C8AE]">
                    Recover Your GCI in 48 Hours.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-[#B0ACA3] leading-[1.7] tracking-[0.01em] max-w-xl">
                  Forensic GCI verification for managing brokers. We find split
                  drift, uncollected referral fees, and ALTA mismatches across
                  every closed side. 100% written, zero calls.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <MagneticButton>
                  <button
                    type="button"
                    onClick={handleOpenModal}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B6B4A] hover:bg-[#117C57] text-[#F7F3EB] border border-[#D8C8AE]/20 font-semibold text-sm sm:text-base h-12 px-6 shadow-[0_10px_28px_rgba(0,0,0,0.45),0_4px_16px_rgba(11,107,74,0.3)] transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Get My Free 3-Deal Audit
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </MagneticButton>
                <button
                  type="button"
                  onClick={handleScrollToTool}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B110F]/85 backdrop-blur-xl border border-[#D8C8AE]/20 hover:border-[#D8C8AE]/45 text-[#E8E2D6] hover:text-white font-medium text-sm h-12 px-5 transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Try the Audit Tool
                  <ArrowDown className="w-4 h-4 text-[#D8C8AE]" />
                </button>
              </div>

              {/* Hero Stats Bar */}
              <div className="border-t border-[#D8C8AE]/[0.12] pt-6 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-[#A8A49B]">Sample Leakage</div>
                  <div className="mt-1 font-mono text-xl sm:text-2xl font-semibold text-[#F7F3EB]">
                    <AnimatedNumber value={7445} prefix="$" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#A8A49B]">90d Recovery</div>
                  <div className="mt-1 font-mono text-xl sm:text-2xl font-semibold text-[#58B38E]">
                    <AnimatedNumber value={22335} prefix="+$" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#A8A49B]">Turnaround</div>
                  <div className="mt-1 text-xl sm:text-2xl font-semibold text-[#F7F3EB]">
                    <span className="font-mono tabular-nums">48h</span> Async
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right Visual Anchor: Candid US Female Real Estate Broker + Floating Glass Cards */}
            <ScrollReveal
              aboveFold={true}
              delay={0.08}
              className="lg:col-span-6 relative"
            >
              {/* Soft Deep Emerald Ambient Shadow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-3 rounded-[26px] bg-[#0B6B4A]/15 blur-3xl opacity-50"
              />

              <div className="relative h-full min-h-[420px] sm:min-h-[500px] rounded-[20px] overflow-hidden border border-[#D8C8AE]/20 shadow-[0_28px_70px_rgba(0,0,0,0.6)]">
                <ParallaxPhoto
                  src="/images/candid/hero-broker.jpg"
                  alt="Smiling professional US female real estate managing broker in a bright modern glass office"
                  priority={true}
                  className="w-full h-full"
                  imgClassName="object-top"
                  sizes="(max-width: 1024px) 100vw, 640px"
                  strength={16}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060A08]/88 via-[#060A08]/18 to-transparent"
                />

                {/* Floating Glass Cards over Hero Photo */}
                <div className="absolute inset-x-4 sm:inset-x-6 bottom-4 sm:bottom-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Floating Card 1: $7,445 Leakage */}
                  <div className="rounded-2xl bg-[#060A08]/88 backdrop-blur-xl border border-[#D8C8AE]/20 p-4 shadow-[0_14px_34px_rgba(0,0,0,0.55)]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[#D4D0C8]">
                        Sample Leakage Found
                      </span>
                      <TrendingDown className="w-4 h-4 text-[#D98276] shrink-0" />
                    </div>
                    <div className="mt-1.5 font-mono text-2xl sm:text-3xl font-semibold text-[#F7F3EB] tabular-nums">
                      <AnimatedNumber value={7445} prefix="$" />
                    </div>
                    <div className="mt-1 text-[11px] text-[#A8A49B]">
                      Flagged across 3 closed sides
                    </div>
                  </div>

                  {/* Floating Card 2: +$22,335 Recovered */}
                  <div className="rounded-2xl bg-[#060A08]/88 backdrop-blur-xl border border-[#0B6B4A]/70 p-4 shadow-[0_14px_34px_rgba(0,0,0,0.55)]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[#D8C8AE]">
                        90-Day GCI Recovered
                      </span>
                      <TrendingUp className="w-4 h-4 text-[#58B38E] shrink-0" />
                    </div>
                    <div className="mt-1.5 font-mono text-2xl sm:text-3xl font-semibold text-[#58B38E] tabular-nums">
                      <AnimatedNumber value={22335} prefix="+$" />
                    </div>
                    <div className="mt-1 text-[11px] text-[#D4D0C8]">
                      Split drift + referrals + fees
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Continuous Platform Trust Marquee */}
        <TrustMarquee />

        {/* 3. PROBLEM SECTION */}
        <ProblemSection
          onScrollToTool={handleScrollToTool}
          onRequestAudit={handleOpenModal}
        />

        {/* 4. AUDIT TOOL — INTERACTIVE SAAS CORE + DELIVERABLE MOCKUPS */}
        <LeakageAuditTool onRequestAuditWithNote={handleOpenModalWithNote} />

        {/* 5. COVERAGE — 4 GLASS CARDS (NO TABLE) */}
        <CoverageCardsSection />

        {/* 6. AUDIT SNAPSHOTS — REAL GCI RECOVERED WITH OWNER PHOTOS */}
        <AuditSnapshotsSection onOpenPrivacy={() => setPrivacyOpen(true)} />

        {/* 7. COMPARISON — MANUAL WAY VS ZED WAY */}
        <ComparisonSection />

        {/* 8. FAQ — 4-QUESTION EXECUTIVE ACCORDION */}
        <ExecutiveFaqSection />

        {/* 9. FINAL CTA SECTION */}
        <section className="relative border-t border-[#D8C8AE]/[0.12] bg-[#0A0F0D]/90 py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <GlassSpotlightCard
                borderBeam={true}
                tilt={false}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                  {/* Left: Final Punchy Conversion Block */}
                  <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between gap-8">
                    <div className="space-y-5">
                      <div className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.04em] text-[#D8C8AE]">
                        <ShieldCheck className="w-4 h-4 text-[#58B38E] shrink-0" />
                        Free 3-Deal Forensic Diagnostic · 100% Async
                      </div>

                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] leading-[1.08] text-[#F7F3EB] [text-wrap:balance]">
                        Stop Leaking.{' '}
                        <span className="italic font-medium text-[#D8C8AE]">
                          Start Recovering.
                        </span>
                      </h2>

                      <p className="text-base sm:text-lg text-[#B0ACA3] leading-[1.7] tracking-[0.01em] max-w-xl">
                        Submit 3 closed deals in writing. Get your Executive PDF
                        Summary, Line-by-Line Discrepancy CSV, and Private Loom
                        walkthrough in 48h.
                      </p>

                      <div className="pt-2 space-y-3">
                        <MagneticButton className="w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={handleOpenModal}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B6B4A] hover:bg-[#117C57] text-[#F7F3EB] border border-[#D8C8AE]/20 font-semibold text-sm sm:text-base h-13 px-7 shadow-[0_12px_30px_rgba(0,0,0,0.45),0_4px_18px_rgba(11,107,74,0.3)] transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap"
                          >
                            Request Written Audit
                            <ArrowRight className="w-4 h-4 shrink-0" />
                          </button>
                        </MagneticButton>
                        <div className="text-xs text-[#C7C2B8]">
                          No commitment. Written report in 48h.
                        </div>
                      </div>
                    </div>

                    <ConfidentialityGuaranteeBar
                      onOpenPrivacy={() => setPrivacyOpen(true)}
                    />
                  </div>

                  {/* Right: Confident Brokerage Owner Portrait */}
                  <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full border-t lg:border-t-0 lg:border-l border-[#D8C8AE]/15">
                    <ParallaxPhoto
                      src="/images/candid/cta-owner.jpg"
                      alt="Confident US brokerage owner smiling with arms crossed in a modern sunlit office"
                      className="w-full h-full"
                      imgClassName="object-top"
                      sizes="(max-width: 1024px) 100vw, 520px"
                      strength={16}
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060A08]/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0B110F]/55 lg:via-transparent lg:to-transparent"
                    />
                  </div>
                </div>
              </GlassSpotlightCard>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* 10. FOOTER */}
      <footer className="relative z-10 border-t border-[#D8C8AE]/[0.12] bg-[#060A08] py-10 text-xs text-[#A8A49B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-[family-name:var(--font-display)] font-semibold tracking-[0.02em] text-[#F5F2EB]">
              ZED AUTOMATION
            </span>
            <span aria-hidden="true" className="text-[#D8C8AE]/25">
              ·
            </span>
            <span>Forensic Commission Audit</span>
            <span aria-hidden="true" className="text-[#D8C8AE]/25">
              ·
            </span>
            <a
              href="mailto:zakaria@zedautomations.tech"
              className="inline-flex items-center gap-1.5 text-[#D4D0C8] hover:text-[#D8C8AE] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#D8C8AE]" />
              zakaria@zedautomations.tech
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium">
            <a
              href="#tool"
              className="hover:text-[#F5F2EB] transition-colors whitespace-nowrap"
            >
              Tool
            </a>
            <a
              href="#results"
              className="hover:text-[#F5F2EB] transition-colors whitespace-nowrap"
            >
              Results
            </a>
            <a
              href="#protocol"
              className="hover:text-[#F5F2EB] transition-colors whitespace-nowrap"
            >
              Protocol
            </a>
            <a
              href="#faq"
              className="hover:text-[#F5F2EB] transition-colors whitespace-nowrap"
            >
              FAQ
            </a>
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-[#F5F2EB] transition-colors cursor-pointer whitespace-nowrap"
            >
              Privacy &amp; NDA
            </button>
            <Link
              href="/commission-audit"
              className="inline-flex items-center gap-1.5 text-[#D8C8AE] hover:text-[#F7F3EB] transition-colors whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5" />
              Client Portal
            </Link>
            <span className="text-[#78746C] whitespace-nowrap">
              &copy; 2026 ZED Automation
            </span>
          </div>
        </div>
      </footer>

      <WrittenAuditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialNotes={prefilledNotes}
      />

      <PrivacyConfidentialityModal
        open={privacyOpen}
        onOpenChange={setPrivacyOpen}
      />
    </div>
  );
}
