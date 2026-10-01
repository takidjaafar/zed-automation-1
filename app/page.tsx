import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/features/dashboard/components/Logo";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-12 sm:p-16 font-[family-name:var(--font-geist-sans)] bg-slate-50 dark:bg-slate-950">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-2xl w-full">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-emerald-500/20">
            Z
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Zed Automation</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">OpenFront Real Estate & Commission Audit Suite</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm w-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              New Module Available
            </span>
            <span className="text-xs text-slate-400">v2.4 Audit Engine</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Commission Audit & Leakage Detector
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Detect brokerage overpayments, underpayments to agents, and uncollected incoming referral fees across all real estate transactions.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/commission-audit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm h-11 px-5 shadow-sm transition"
            >
              Open Commission Audit Tool &rarr;
            </Link>
            <a
              href="/commission-audit.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm h-11 px-5 shadow-sm transition"
            >
              Standalone HTML Version
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">Admin Dashboard</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">KeystoneJS & Next.js admin interface for models and permissions.</p>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              Launch Dashboard &rarr;
            </Link>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">GraphQL API</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Yoga GraphQL interactive playground and schema endpoint.</p>
            <a
              href="/api/graphql"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              Open API Explorer &rarr;
            </a>
          </div>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-xs text-slate-500">
        <span>Zed Automation Real Estate Audit Engine</span>
        <span>&bull;</span>
        <a href="/commission-audit.html" className="hover:underline">Standalone Single-File HTML</a>
        <span>&bull;</span>
        <Link href="/commission-audit" className="hover:underline">App Route (/commission-audit)</Link>
      </footer>
    </div>
  );
}
