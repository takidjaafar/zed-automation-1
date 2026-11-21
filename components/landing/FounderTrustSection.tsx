'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/MotionPrimitives';

export default function FounderTrustSection() {
  return (
    <section
      id="behind-zed"
      className="relative py-16 sm:py-24"
      aria-labelledby="whos-behind-zed-heading"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="rounded-[22px] bg-[#ECE3D3] text-[#141A17] border border-[#D8C8AE] shadow-[0_24px_64px_rgba(0,0,0,0.45)] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-7 md:gap-9 items-center p-6 sm:p-10 lg:p-12">
              {/* Small Candid Natural-Light Portrait */}
              <div className="md:col-span-4 flex justify-start md:justify-center">
                <div className="relative w-44 h-52 sm:w-52 sm:h-64 md:w-full md:max-w-[240px] md:h-[290px] rounded-2xl overflow-hidden border border-[#141A17]/15 shadow-[0_12px_28px_rgba(20,26,23,0.16)] bg-[#DDD2BE]">
                  <Image
                    src="/images/candid/founder-portrait.jpg"
                    alt="Independent forensic commission auditor at a natural-light office desk"
                    fill
                    sizes="(max-width: 768px) 220px, 260px"
                    referrerPolicy="no-referrer"
                    className="object-cover object-top"
                  />
                </div>
              </div>

              {/* First-Person Independent Practice Copy */}
              <div className="md:col-span-8 space-y-5">
                <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.04em] text-[#0B6B4A]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  Independent Forensic Practice · Single Reviewer
                </div>

                <h2
                  id="whos-behind-zed-heading"
                  className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-[1.1] text-[#111714]"
                >
                  Who&apos;s Behind Zed
                </h2>

                <p className="text-[15px] sm:text-base text-[#27302B] leading-[1.72] tracking-[0.01em]">
                  Zed Automation is an independent forensic audit practice. I
                  built it to help brokerage owners find commission leakage
                  without adding another vendor call to their week. Every audit
                  is reviewed personally by me, using a fixed checklist. Small
                  by design.
                </p>

                <div className="pt-4 border-t border-[#141A17]/12 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-[13px] text-[#3F4A44]">
                  <span className="font-semibold text-[#111714]">
                    Zakaria · Principal Forensic Auditor
                  </span>
                  <span>Direct written desk · zakaria@zedautomations.tech</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
