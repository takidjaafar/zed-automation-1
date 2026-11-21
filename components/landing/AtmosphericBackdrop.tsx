'use client';

import React from 'react';
import { motion } from 'motion/react';

const FLOATING_PARTICLES = [
  { id: 'p1', left: '10%', top: '16%', size: 3, duration: 14, delay: 0 },
  { id: 'p2', left: '24%', top: '42%', size: 2, duration: 18, delay: 1.5 },
  { id: 'p3', left: '38%', top: '24%', size: 3, duration: 16, delay: 0.8 },
  { id: 'p4', left: '56%', top: '14%', size: 2, duration: 20, delay: 2.1 },
  { id: 'p5', left: '72%', top: '34%', size: 3, duration: 15, delay: 0.4 },
  { id: 'p6', left: '86%', top: '20%', size: 2, duration: 19, delay: 1.9 },
  { id: 'p7', left: '16%', top: '72%', size: 2, duration: 17, delay: 2.6 },
  { id: 'p8', left: '48%', top: '66%', size: 3, duration: 21, delay: 1.1 },
  { id: 'p9', left: '80%', top: '74%', size: 2, duration: 16, delay: 2.8 },
] as const;

export default function AtmosphericBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050807]"
    >
      {/* Architectural SaaS Hairline Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_90%_75%_at_50%_18%,#000_45%,transparent_100%)]" />

      {/* Animated Emerald Aurora Gradient Layer 1 */}
      <motion.div
        animate={{
          x: ['-6%', '6%', '-3%'],
          y: ['-4%', '5%', '-2%'],
          scale: [1, 1.08, 0.98],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        className="absolute -top-44 left-[8%] h-[540px] w-[760px] rounded-full bg-emerald-500/[0.11] blur-[150px] will-change-transform"
      />

      {/* Animated Aurora Gradient Layer 2 */}
      <motion.div
        animate={{
          x: ['5%', '-5%', '3%'],
          y: ['4%', '-4%', '2%'],
          scale: [1.02, 0.96, 1.06],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        className="absolute top-[28%] -right-32 h-[540px] w-[720px] rounded-full bg-[#34D399]/[0.08] blur-[160px] will-change-transform"
      />

      {/* Animated Aurora Gradient Layer 3 (Lower Canvas Glow) */}
      <motion.div
        animate={{
          x: ['-4%', '5%', '-2%'],
          y: ['3%', '-5%', '2%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        className="absolute bottom-[-12%] left-[25%] h-[460px] w-[680px] rounded-full bg-teal-500/[0.07] blur-[165px] will-change-transform"
      />

      {/* Subtle Floating Emerald Particles */}
      {FLOATING_PARTICLES.map((particle) => (
        <motion.span
          key={particle.id}
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -28, 8, 0],
            opacity: [0.16, 0.55, 0.22, 0.16],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute rounded-full bg-emerald-400/70 will-change-transform"
        />
      ))}
    </div>
  );
}
