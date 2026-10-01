'use client';

import React from 'react';

/**
 * The shared Zed Automation brand block used in the audit workspace and in the
 * read-only client view.
 */
export default function AuditBrand({
  subtitle = 'Commission Audit & Leakage Detector',
  badge,
}: {
  subtitle?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-emerald-500/20">
        Z
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-white">Zed Automation</h1>
          {badge ?? (
            <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Audit Suite
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}
