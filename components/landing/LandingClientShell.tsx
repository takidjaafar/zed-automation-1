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
    <div className="relative min-h-screen bg-[#050807] text-white flex flex-col overflow-x-clip">
      <AtmosphericBackdrop />

      {/* 1. FIXED GLASS NAVBAR (3-Zone Top Bar Contract) */}
      <header className="sticky top-0 z-40 border-b border-emerald-500/15 bg-[#050807]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Brand Zone */}
          <Link href="/" className="flex items-center gap-3 min-w-0 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-[#0A110F] border border-emerald-500/30 shadow-[0_0_16px_rgba(16,185,129,0.2)] flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src="/assets/aistudio/ZED_SVG_e2b1063b.svg"
                alt="ZED Automation logo"
                width={32}
                height={32}
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="font-[family-name:var(--font-display)] text-sm sm:text-base font-extrabold tracking-[-0.02em] text-white whitespace-nowrap shrink-0">
              ZED AUTOMATION
            </span>
          </Link>

          {/* Center Nav Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-8 text-sm font-medium text-[#9CA3AF]"
          >
            <a
              href="#tool"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Tool
            </a>
            <a
              href="#results"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Results
            </a>
            <a
              href="#protocol"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Protocol
            </a>
            <a
              href="#faq"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
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
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#050807] px-4 sm:px-5 h-10 text-xs sm:text-sm font-bold shadow-[0_0_24px_rgba(16,185,129,0.34)] transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap shrink-0"
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
              <div className="text-xs font-medium text-[#34D399]">
                Forensic GCI Verification · 48h PDF + Loom · 100% Written, Zero Calls
              </div>

              <div className="space-y-4">
                <h1 className="text-[clamp(2.35rem,4.2vw,3.75rem)] font-extrabold tracking-[-0.03em] leading-[1.05] text-white [text-wrap:balance]">
                  Stop Leaking Commissions.{' '}
                  <span className="text-[#34D399]">
                    Recover Your GCI in 48 Hours.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-[#9CA3AF] leading-relaxed max-w-xl">
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
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#050807] font-bold text-sm sm:text-base h-12 px-6 shadow-[0_0_34px_rgba(16,185,129,0.4)] transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Get My Free 3-Deal Audit
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </MagneticButton>
                <button
                  type="button"
                  onClick={handleScrollToTool}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A0F0D]/85 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/50 text-slate-100 hover:text-white font-semibold text-sm h-12 px-5 transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Try the Audit Tool
                  <ArrowDown className="w-4 h-4 text-[#34D399]" />
                </button>
              </div>

              {/* Hero Stats Bar */}
              <div className="border-t border-white/[0.08] pt-6 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-[#9CA3AF]">Sample Leakage</div>
                  <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-white">
                    <AnimatedNumber value={7445} prefix="$" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#9CA3AF]">90d Recovery</div>
                  <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-[#34D399]">
                    <AnimatedNumber value={22335} prefix="+$" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#9CA3AF]">Turnaround</div>
                  <div className="mt-1 text-xl sm:text-2xl font-bold text-white">
                    <span className="font-mono tabular-nums">48h</span> Async
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right Visual Anchor: Smiling Female US Real Estate Broker + Floating Glass Cards */}
            <ScrollReveal
              aboveFold={true}
              delay={0.08}
              className="lg:col-span-6 relative"
            >
              {/* Soft Emerald Back-Glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-4 rounded-[28px] bg-emerald-500/15 blur-3xl opacity-60"
              />

              <div className="relative h-full min-h-[420px] sm:min-h-[500px] rounded-[20px] overflow-hidden border border-emerald-500/30 shadow-[0_28px_70px_rgba(0,0,0,0.6),0_0_44px_rgba(16,185,129,0.18)]">
                <ParallaxPhoto
                  src="/images/hero-female-broker.jpg"
                  alt="Smiling professional US female real estate managing broker in a bright modern glass office"
                  priority={true}
                  className="w-full h-full"
                  imgClassName="object-top"
                  sizes="(max-width: 1024px) 100vw, 640px"
                  strength={16}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050807]/85 via-[#050807]/15 to-transparent"
                />

                {/* Floating Glass Cards over Hero Photo */}
                <div className="absolute inset-x-4 sm:inset-x-6 bottom-4 sm:bottom-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Floating Card 1: $7,445 Leakage */}
                  <div className="rounded-2xl bg-[#050807]/85 backdrop-blur-xl border border-rose-400/35 p-4 shadow-[0_14px_34px_rgba(0,0,0,0.55)]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-300">
                        Sample Leakage Found
                      </span>
                      <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
                    </div>
                    <div className="mt-1.5 font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">
                      <AnimatedNumber value={7445} prefix="$" />
                    </div>
                    <div className="mt-1 text-[11px] text-[#9CA3AF]">
                      Flagged across 3 closed sides
                    </div>
                  </div>

                  {/* Floating Card 2: +$22,335 Recovered */}
                  <div className="rounded-2xl bg-[#050807]/85 backdrop-blur-xl border border-emerald-400/45 p-4 shadow-[0_14px_34px_rgba(0,0,0,0.55),0_0_28px_rgba(16,185,129,0.28)]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-emerald-300">
                        90-Day GCI Recovered
                      </span>
                      <TrendingUp className="w-4 h-4 text-[#34D399] shrink-0" />
                    </div>
                    <div className="mt-1.5 font-mono text-2xl sm:text-3xl font-bold text-[#34D399] tabular-nums">
                      <AnimatedNumber value={22335} prefix="+$" />
                    </div>
                    <div className="mt-1 text-[11px] text-slate-300">
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
        <section className="relative border-t border-emerald-500/15 bg-[#0A0F0D]/90 py-20 sm:py-28">
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
                      <div className="inline-flex items-center gap-2 text-xs font-medium text-[#34D399]">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        Free 3-Deal Forensic Diagnostic · 100% Async
                      </div>

                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] leading-[1.06] text-white [text-wrap:balance]">
                        Stop Leaking.{' '}
                        <span className="text-[#34D399]">
                          Start Recovering.
                        </span>
                      </h2>

                      <p className="text-base sm:text-lg text-[#9CA3AF] leading-relaxed max-w-xl">
                        Submit 3 closed deals in writing. Get your Executive PDF
                        Summary, Line-by-Line Discrepancy CSV, and Private Loom
                        walkthrough in 48h.
                      </p>

                      <div className="pt-2 space-y-3">
                        <MagneticButton className="w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={handleOpenModal}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#050807] font-bold text-sm sm:text-base h-13 px-7 shadow-[0_0_38px_rgba(16,185,129,0.45)] transition-all active:scale-[0.985] cursor-pointer whitespace-nowrap"
                          >
                            Request Written Audit
                            <ArrowRight className="w-4 h-4 shrink-0" />
                          </button>
                        </MagneticButton>
                        <div className="text-xs text-slate-300">
                          No commitment. Written report in 48h.
                        </div>
                      </div>
                    </div>

                    <ConfidentialityGuaranteeBar
                      onOpenPrivacy={() => setPrivacyOpen(true)}
                    />
                  </div>

                  {/* Right: Confident Brokerage Owner Portrait */}
                  <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full border-t lg:border-t-0 lg:border-l border-emerald-500/20">
                    <ParallaxPhoto
                      src="/images/cta-confident-owner.jpg"
                      alt="Confident US brokerage owner smiling with arms crossed in a modern sunlit office"
                      className="w-full h-full"
                      imgClassName="object-top"
                      sizes="(max-width: 1024px) 100vw, 520px"
                      strength={16}
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050807]/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0A110F]/55 lg:via-transparent lg:to-transparent"
                    />
                  </div>
                </div>
              </GlassSpotlightCard>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* 10. FOOTER */}
      <footer className="relative z-10 border-t border-emerald-500/15 bg-[#050807] py-10 text-xs text-[#9CA3AF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-[family-name:var(--font-display)] font-extrabold tracking-tight text-white">
              ZED AUTOMATION
            </span>
            <span aria-hidden="true" className="text-white/20">
              ·
            </span>
            <span>Forensic Commission Audit</span>
            <span aria-hidden="true" className="text-white/20">
              ·
            </span>
            <a
              href="mailto:zakaria@zedautomations.tech"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#34D399] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#34D399]" />
              zakaria@zedautomations.tech
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium">
            <a
              href="#tool"
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              Tool
            </a>
            <a
              href="#results"
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              Results
            </a>
            <a
              href="#protocol"
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              Protocol
            </a>
            <a
              href="#faq"
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              FAQ
            </a>
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Privacy &amp; NDA
            </button>
            <Link
              href="/commission-audit"
              className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-[#34D399] transition-colors whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5" />
              Client Portal
            </Link>
            <span className="text-slate-500 whitespace-nowrap">
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
