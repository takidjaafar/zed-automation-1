import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  EyeOff,
  FileKey2,
  Lock,
  Mail,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { AUDIT_DESK_EMAIL } from '@/lib/commission-audit/audit-intake';

export const metadata: Metadata = {
  title:
    'Privacy Policy & NDA Terms | ZED Automation - Forensic Commission Audit for US Real Estate Brokerages',
  description:
    'How ZED Automation handles brokerage settlement summaries: encrypted in transit, reviewed solely by the independent auditor, and permanently deleted 48 hours after report delivery.',
  alternates: {
    canonical: '/privacy',
  },
};

const POLICY_SECTIONS = [
  {
    icon: FileKey2,
    title: '1. How Files Are Received',
    body: 'We accept only the closed settlement summaries, commission worksheets, or redacted Closing Disclosures you choose to share for your written audit. Submissions arrive through our encrypted intake form or directly via written email to the audit desk.',
  },
  {
    icon: Lock,
    title: '2. Encrypted in Transit & Isolated Handling',
    body: 'Every submission and document transfer is encrypted in transit over HTTPS/TLS. Files are placed in a private, access-controlled audit workspace strictly for line-by-line commission reconciliation.',
  },
  {
    icon: ShieldCheck,
    title: '3. Only the Auditor Sees Your Files',
    body: 'Zed Automation is an independent practice. Your files are reviewed personally by the principal auditor and are never outsourced to offshore teams, subcontractors, or third-party AI training pipelines.',
  },
  {
    icon: Trash2,
    title: '4. Retained Until Delivery + 48 Hours, Then Permanently Deleted',
    body: 'Submitted settlement summaries, deal notes, and working extracts are retained only for the duration of your audit plus 48 hours following delivery of your Executive PDF Summary, Discrepancy CSV, and Private Loom walkthrough. After that 48-hour window, all source files are permanently deleted.',
  },
  {
    icon: EyeOff,
    title: '5. Never Sold, Never Shared',
    body: 'Brokerage names, agent rosters, commission split schedules, and client transaction details are strictly confidential under mutual NDA terms. Your data is never sold, rented, traded, or shared with any third party, lender, recruiter, or vendor.',
  },
  {
    icon: ShieldCheck,
    title: '6. Zero Account Credentials Requested',
    body: 'We never ask for bank credentials, QuickBooks logins, brokerage accounting passwords, or MLS logins. Every diagnostic is performed solely from the closed deal documents you explicitly provide.',
  },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#060A08] text-[#F5F2EB] flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[#D8C8AE]/[0.12] bg-[#060A08]/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#D8C8AE] hover:text-[#F7F3EB] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            Back to ZED Automation
          </Link>
          <span className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.02em] text-[#F7F3EB]">
            ZED AUTOMATION
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.04em] text-[#D8C8AE]">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            Privacy Policy &amp; Mutual NDA Protocol
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] leading-[1.08] text-[#F7F3EB]">
            Brokerage Data Confidentiality &amp;{' '}
            <span className="italic font-medium text-[#D8C8AE]">
              48-Hour Purge Policy
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[#B0ACA3] leading-[1.7] max-w-2xl">
            ZED Automation provides forensic commission audits for US real
            estate brokerages. This policy sets out in plain English how closed
            transaction files are received, protected, and permanently deleted.
          </p>
        </div>

        <div className="rounded-[20px] bg-[#0B110F]/90 border border-[#D8C8AE]/[0.14] divide-y divide-[#D8C8AE]/[0.1] overflow-hidden">
          {POLICY_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.title}
                className="p-6 sm:p-8 flex items-start gap-4"
              >
                <div className="h-9 w-9 rounded-xl bg-[#0B6B4A]/20 border border-[#D8C8AE]/20 flex items-center justify-center text-[#D8C8AE] shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-2 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-[#F7F3EB]">
                    {section.title}
                  </h2>
                  <p className="text-sm sm:text-[15px] text-[#C4C0B7] leading-[1.7]">
                    {section.body}
                  </p>
                </div>
              </section>
            );
          })}
        </div>

        <div className="rounded-[20px] bg-[#0B110F]/90 border border-[#0B6B4A]/60 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-[#F7F3EB]">
              Need a Countersigned Mutual NDA Before Sending Deals?
            </h2>
            <p className="text-sm text-[#B0ACA3] leading-[1.65]">
              Request a signed copy or ask a data-handling question directly in
              writing—zero phone calls required.
            </p>
          </div>
          <a
            href={`mailto:${AUDIT_DESK_EMAIL}?subject=${encodeURIComponent(
              'Mutual NDA & Privacy Inquiry — ZED Automation',
            )}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B6B4A] hover:bg-[#117C57] text-[#F7F3EB] border border-[#D8C8AE]/20 text-sm font-semibold h-11 px-5 transition-colors whitespace-nowrap shrink-0"
          >
            <Mail className="w-4 h-4 shrink-0" />
            {AUDIT_DESK_EMAIL}
          </a>
        </div>
      </main>

      <footer className="border-t border-[#D8C8AE]/[0.12] py-8 text-xs text-[#A8A49B]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <span>&copy; 2026 ZED Automation · Forensic Commission Audit for US Real Estate Brokerages</span>
          <Link
            href="/"
            className="text-[#D8C8AE] hover:text-[#F7F3EB] transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </footer>
    </div>
  );
}
