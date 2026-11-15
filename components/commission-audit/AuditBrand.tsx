'use client';

import React from 'react';
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
      <div className="h-9 w-9 rounded-lg bg-[#10B981] text-[#05080F] flex items-center justify-center font-extrabold text-base tracking-tight shrink-0 shadow-sm shadow-emerald-500/20">
        Z
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
