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
    <div className="flex items-center gap-3 min-w-0">
      <div className="h-9 w-9 rounded-lg bg-[#0B1120] border border-[#10B981]/35 flex items-center justify-center overflow-hidden shrink-0 shadow-sm shadow-emerald-500/10">
        <Image
          src="/assets/aistudio/ZED_SVG_e2b1063b.svg"
          alt="Zed Automation logo"
          width={36}
          height={36}
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
          Zed Automation
        </span>
        <span className="text-slate-700 hidden sm:inline" aria-hidden="true">
          /
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[#10B981] whitespace-nowrap shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          {tag}
        </span>
      </div>
    </div>
  );
}
