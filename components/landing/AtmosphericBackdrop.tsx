'use client';

import React from 'react';
import { motion } from 'motion/react';

const FLOATING_PARTICLES = [
  { id: 'p1', left: '12%', top: '18%', size: 2, duration: 22, delay: 0 },
  { id: 'p2', left: '34%', top: '38%', size: 2, duration: 26, delay: 1.8 },
  { id: 'p3', left: '62%', top: '20%', size: 2, duration: 24, delay: 0.9 },
  { id: 'p4', left: '82%', top: '46%', size: 2, duration: 28, delay: 2.2 },
  { id: 'p5', left: '22%', top: '74%', size: 2, duration: 25, delay: 1.4 },
  { id: 'p6', left: '70%', top: '78%', size: 2, duration: 27, delay: 2.6 },
] as const;

export default function AtmosphericBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#060A08]"
    >
      {/* Subtle Warm Architectural Hairline Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(216,200,174,0.032)_1px,transparent_1px),linear-gradient(to_bottom,rgba(216,200,174,0.032)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_90%_75%_at_50%_18%,#000_42%,transparent_100%)]" />

      {/* Deep Forest Emerald Ambient Wash */}
      <motion.div
        animate={{
          x: ['-4%', '4%', '-2%'],
          y: ['-3%', '3%', '-2%'],
          scale: [1, 1.05, 0.98],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        className="absolute -top-48 left-[8%] h-[540px] w-[760px] rounded-full bg-[#0B6B4A]/[0.16] blur-[160px] will-change-transform"
      />

      {/* Warm Stone Beige Editorial Highlight Wash */}
      <motion.div
        animate={{
          x: ['3%', '-4%', '2%'],
          y: ['3%', '-3%', '2%'],
          scale: [1.01, 0.97, 1.04],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        className="absolute top-[28%] -right-32 h-[500px] w-[680px] rounded-full bg-[#D8C8AE]/[0.055] blur-[170px] will-change-transform"
      />

      {/* Lower Deep Emerald Grounding Wash */}
      <motion.div
        animate={{
          x: ['-3%', '4%', '-2%'],
          y: ['2%', '-4%', '2%'],
        }}
        transition={{
          duration: 34,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        className="absolute bottom-[-14%] left-[24%] h-[440px] w-[660px] rounded-full bg-[#0B6B4A]/[0.11] blur-[175px] will-change-transform"
      />

      {/* Subtle Warm Dust Motes (Restrained Editorial Texture) */}
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
            y: [0, -18, 6, 0],
            opacity: [0.08, 0.24, 0.1, 0.08],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute rounded-full bg-[#D8C8AE]/45 will-change-transform"
        />
      ))}
    </div>
  );
}
