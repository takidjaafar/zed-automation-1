'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

/**
 * Shared Zed Automation brand block used in the unified top navigation bar
 * across the gated audit workspace, client manager, and read-only share portal.
 */
export default function AuditBrand({
  tag = 'Client Fulfillment Portal',
}: {
  subtitle?: string;
  badge?: React.ReactNode;
  tag?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <div className="h-8 w-8 rounded-lg bg-[#0B1210] border border-emerald-400/30 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_18px_rgba(16,185,129,0.18)]">
        <Image
          src="/assets/aistudio/ZED_SVG_e2b1063b.svg"
          alt="Zed Automation logo"
          width={32}
          height={32}
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm sm:text-base font-bold tracking-[-0.02em] text-white whitespace-nowrap shrink-0">
          Zed Automation
        </span>
        <span className="text-emerald-400/30 hidden xl:inline" aria-hidden="true">
          /
        </span>
        <span className="hidden xl:inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300/90 whitespace-nowrap shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
          {tag}
        </span>
      </div>
    </div>
  );
}
