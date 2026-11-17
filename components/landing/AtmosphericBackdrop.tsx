'use client';

import React from 'react';
import { motion } from 'motion/react';

const DUST_PARTICLES = [
  { pos: 'left-[7%] top-[12%]', size: 'h-1 w-1', duration: 9, delay: 0 },
  { pos: 'left-[16%] top-[28%]', size: 'h-1.5 w-1.5', duration: 11, delay: 1.2 },
  { pos: 'left-[24%] top-[8%]', size: 'h-1 w-1', duration: 8, delay: 0.6 },
  { pos: 'left-[35%] top-[22%]', size: 'h-1 w-1', duration: 12, delay: 2.1 },
  { pos: 'left-[48%] top-[14%]', size: 'h-1.5 w-1.5', duration: 10, delay: 0.4 },
  { pos: 'left-[62%] top-[10%]', size: 'h-1 w-1', duration: 9.5, delay: 1.7 },
  { pos: 'left-[74%] top-[24%]', size: 'h-1.5 w-1.5', duration: 13, delay: 0.9 },
  { pos: 'left-[88%] top-[16%]', size: 'h-1 w-1', duration: 10.5, delay: 2.5 },
  { pos: 'left-[12%] top-[54%]', size: 'h-1 w-1', duration: 11.5, delay: 1.4 },
  { pos: 'left-[29%] top-[66%]', size: 'h-1.5 w-1.5', duration: 10, delay: 0.3 },
  { pos: 'left-[53%] top-[58%]', size: 'h-1 w-1', duration: 12.5, delay: 2.0 },
  { pos: 'left-[71%] top-[49%]', size: 'h-1 w-1', duration: 9, delay: 1.1 },
  { pos: 'left-[84%] top-[64%]', size: 'h-1.5 w-1.5', duration: 11, delay: 0.5 },
  { pos: 'left-[92%] top-[42%]', size: 'h-1 w-1', duration: 8.5, delay: 1.8 },
  { pos: 'left-[18%] top-[84%]', size: 'h-1.5 w-1.5', duration: 12, delay: 0.7 },
  { pos: 'left-[44%] top-[88%]', size: 'h-1 w-1', duration: 9.8, delay: 1.9 },
  { pos: 'left-[66%] top-[82%]', size: 'h-1 w-1', duration: 10.2, delay: 0.2 },
  { pos: 'left-[82%] top-[90%]', size: 'h-1.5 w-1.5', duration: 11.8, delay: 1.3 },
] as const;

export default function AtmosphericBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#040807]"
    >
      {/* Fine Architectural Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Top Radial Mask Fade */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(16,185,129,0.09),transparent_70%)]" />

      {/* Flowing Aurora Gradient Waves */}
      <motion.div
        animate={{
          x: ['-6%', '6%', '-4%'],
          y: ['-4%', '5%', '-2%'],
          scale: [1, 1.08, 0.98],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        className="absolute -top-40 -left-32 h-[540px] w-[720px] rounded-full bg-emerald-500/12 blur-[130px] will-change-transform"
      />

      <motion.div
        animate={{
          x: ['5%', '-6%', '4%'],
          y: ['3%', '-5%', '4%'],
          scale: [1.04, 0.96, 1.05],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        className="absolute top-[28%] -right-40 h-[560px] w-[760px] rounded-full bg-teal-500/10 blur-[140px] will-change-transform"
      />

      <motion.div
        animate={{
          x: ['-4%', '5%', '-3%'],
          y: ['4%', '-4%', '2%'],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        className="absolute -bottom-48 left-[22%] h-[480px] w-[680px] rounded-full bg-emerald-400/10 blur-[140px] will-change-transform"
      />

      {/* Floating Luminous Emerald Dust Particles */}
      <div className="hidden sm:block absolute inset-0">
        {DUST_PARTICLES.map((particle, idx) => (
          <motion.span
            key={idx}
            animate={{
              y: [0, -24, 0],
              x: [0, idx % 2 === 0 ? 10 : -10, 0],
              opacity: [0.22, 0.85, 0.22],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`absolute ${particle.pos} ${particle.size} rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.8)] will-change-transform`}
          />
        ))}
      </div>
    </div>
  );
}
