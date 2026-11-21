'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';

/* -------------------------------------------------------------------------- */
/*  Native Viewport Hook (reliable across scroll & constrained viewports)     */
/* -------------------------------------------------------------------------- */

function useReliableInView(ref: React.RefObject<HTMLElement | null>): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) {
      setVisible(true);
      return;
    }

    const checkRect = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 900;
      if (rect.top <= vh + 240 && rect.bottom >= -120) {
        setVisible(true);
        return true;
      }
      return false;
    };

    if (checkRect()) return;

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
              setVisible(true);
              observer?.disconnect();
              break;
            }
          }
        },
        { threshold: 0.01, rootMargin: '240px 0px' },
      );
      observer.observe(el);
    }

    const onScroll = () => {
      if (checkRect()) {
        observer?.disconnect();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll, { passive: true });

    const initialSettle = window.setTimeout(() => {
      checkRect();
    }, 220);
    const fullRevealFallback = window.setTimeout(() => {
      setVisible(true);
    }, 1600);

    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onScroll);
      window.clearTimeout(initialSettle);
      window.clearTimeout(fullRevealFallback);
    };
  }, [ref, visible]);

  return visible;
}

/* -------------------------------------------------------------------------- */
/*  Scroll Reveal Fade-Up                                                     */
/* -------------------------------------------------------------------------- */

export function ScrollReveal({
  children,
  delay = 0,
  aboveFold = false,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  aboveFold?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useReliableInView(ref);
  const isVisible = aboveFold || inView;

  if (aboveFold) {
    return (
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.52, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Animated Tabular Number Counter (animates from 0 on enter & on change)    */
/* -------------------------------------------------------------------------- */

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useReliableInView(ref);
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(0);
  const hasEnteredRef = useRef<boolean>(false);

  useEffect(() => {
    if (!inView) return;

    const from = hasEnteredRef.current ? prevValueRef.current : 0;
    hasEnteredRef.current = true;
    prevValueRef.current = value;

    const controls = animate(from, value, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [inView, value]);

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(decimals > 0 ? displayValue : Math.round(displayValue));

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Parallax Editorial Photography Container (with Resilient Fallback)        */
/* -------------------------------------------------------------------------- */

export function ParallaxPhoto({
  src,
  alt,
  className = '',
  imgClassName = '',
  priority = false,
  sizes = '(max-width: 1024px) 100vw, 50vw',
  strength = 18,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  strength?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-[#0A110F] ${className}`}
    >
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0A1411] via-[#070D0B] to-[#050807] p-6 text-center">
          <span className="text-xs font-medium text-emerald-300/80">{alt}</span>
        </div>
      ) : (
        <motion.div
          style={{ y }}
          className="absolute -inset-y-6 inset-x-0 will-change-transform"
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className={`object-cover ${imgClassName}`}
          />
        </motion.div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Glassmorphism Card (rounded-[20px], 1px emerald border, lift & shimmer)   */
/* -------------------------------------------------------------------------- */

export function GlassSpotlightCard({
  children,
  className = '',
  borderBeam = false,
  shimmer = true,
  tilt = true,
  variant = 'emerald',
}: {
  children: React.ReactNode;
  className?: string;
  borderBeam?: boolean;
  shimmer?: boolean;
  tilt?: boolean;
  variant?: 'emerald' | 'muted';
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFinePointer, setIsFinePointer] = useState(false);

  const mouseX = useMotionValue(240);
  const mouseY = useMotionValue(160);
  const rotateX = useSpring(0, { stiffness: 220, damping: 24 });
  const rotateY = useSpring(0, { stiffness: 220, damping: 24 });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setIsFinePointer(window.matchMedia('(pointer: fine)').matches);
    }
  }, []);

  const spotlight = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${
    variant === 'emerald'
      ? 'rgba(16, 185, 129, 0.12)'
      : 'rgba(255, 255, 255, 0.05)'
  }, transparent 75%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFinePointer || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);

    if (tilt) {
      const rx = ((y - rect.height / 2) / (rect.height / 2)) * -1.8;
      const ry = ((x - rect.width / 2) / (rect.width / 2)) * 1.8;
      rotateX.set(rx);
      rotateY.set(ry);
    }
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const baseSurface =
    variant === 'emerald'
      ? 'bg-[#0A110F]/80 border-emerald-500/20 border-t-emerald-400/35 hover:border-emerald-400/45 shadow-[0_18px_48px_rgba(0,0,0,0.48),0_0_28px_rgba(16,185,129,0.09)] hover:shadow-[0_22px_56px_rgba(0,0,0,0.55),0_0_38px_rgba(16,185,129,0.18)]'
      : 'bg-[#0B0F0E]/80 border-white/[0.08] hover:border-white/[0.15] shadow-[0_14px_38px_rgba(0,0,0,0.45)]';

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={isFinePointer ? { y: -4 } : undefined}
      style={
        isFinePointer && tilt
          ? { rotateX, rotateY, transformPerspective: 1100 }
          : undefined
      }
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative rounded-[20px] border backdrop-blur-xl overflow-hidden transition-all duration-200 ${baseSurface} ${className}`}
    >
      {/* Top Catch-Light Specular Hairline */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-px z-20 ${
          variant === 'emerald'
            ? 'bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent'
            : 'bg-gradient-to-r from-transparent via-white/15 to-transparent'
        }`}
      />

      {/* Ambient Border Beam Trace */}
      {borderBeam && variant === 'emerald' && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[20px] overflow-hidden z-0"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-[65%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_290deg,rgba(16,185,129,0.34)_328deg,rgba(52,211,153,0.6)_348deg,transparent_360deg)] will-change-transform"
          />
          <div className="absolute inset-px rounded-[19px] bg-[#0A110F]/95" />
        </div>
      )}

      {/* Cursor Tracking Radial Spotlight */}
      {isFinePointer && (
        <motion.div
          aria-hidden="true"
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
      )}

      {/* Shimmer Shine Sweep on Hover */}
      {shimmer && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 -translate-x-full group-hover:translate-x-[150%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-emerald-300/[0.11] to-transparent skew-x-[-20deg]"
        />
      )}

      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Magnetic Primary CTA Wrapper                                              */
/* -------------------------------------------------------------------------- */

export function MagneticButton({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const x = useSpring(0, { stiffness: 320, damping: 22 });
  const y = useSpring(0, { stiffness: 320, damping: 22 });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setIsFinePointer(window.matchMedia('(pointer: fine)').matches);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFinePointer || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = (e.clientX - (rect.left + rect.width / 2)) * 0.18;
    const offsetY = (e.clientY - (rect.top + rect.height / 2)) * 0.24;
    x.set(Math.max(-9, Math.min(9, offsetX)));
    y.set(Math.max(-6, Math.min(6, offsetY)));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={isFinePointer ? { x, y } : undefined}
      className={`inline-flex ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Continuous Platform Trust Marquee                                         */
/* -------------------------------------------------------------------------- */

const TRUST_PLATFORMS = [
  'SkySlope',
  'Dotloop',
  'Follow Up Boss',
  'Brokermint',
  'LoneWolf',
  'KVCore',
  'ALTA / HUD-1',
  'QuickBooks Exports',
] as const;

export function TrustMarquee() {
  return (
    <div className="border-y border-emerald-500/15 bg-[#0A0F0D]/80 backdrop-blur-md py-4 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <span className="text-xs font-medium tracking-wide text-emerald-300/90 whitespace-nowrap shrink-0">
          Reconciles Exports From
        </span>

        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            className="flex w-max items-center gap-8 will-change-transform"
          >
            {[0, 1].map((trackIdx) => (
              <div
                key={trackIdx}
                aria-hidden={trackIdx === 1}
                className="flex items-center gap-8 pr-8"
              >
                {TRUST_PLATFORMS.map((platform) => (
                  <div
                    key={`${trackIdx}-${platform}`}
                    className="flex items-center gap-8 whitespace-nowrap"
                  >
                    <span className="text-sm font-medium tracking-tight text-slate-300">
                      {platform}
                    </span>
                    <span className="text-emerald-500/35 text-xs" aria-hidden="true">
                      ·
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
