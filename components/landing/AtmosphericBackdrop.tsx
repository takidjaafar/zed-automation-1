'use client';

import React from 'react';
import { motion } from 'motion/react';

export default function AtmosphericBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#040807]"
    >
      {/* Fine Architectural Hairline Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_90%_75%_at_50%_15%,#000_45%,transparent_100%)]" />

      {/* Restrained Top Ambient Emerald Catch-Light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_50%_at_50%_-8%,rgba(16,185,129,0.075),transparent_70%)]" />

      {/* Soft Anodized Ambient Gradient Drift */}
      <motion.div
        animate={{
          x: ['-4%', '4%', '-2%'],
          y: ['-2%', '3%', '-1%'],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        className="absolute -top-48 -left-32 h-[520px] w-[680px] rounded-full bg-emerald-500/[0.06] blur-[150px] will-change-transform"
      />

      <motion.div
        animate={{
          x: ['3%', '-4%', '2%'],
          y: ['2%', '-3%', '2%'],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        className="absolute top-[30%] -right-44 h-[520px] w-[700px] rounded-full bg-teal-500/[0.045] blur-[160px] will-change-transform"
      />
    </div>
  );
}
