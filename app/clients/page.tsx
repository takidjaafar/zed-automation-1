import ClientsManager from '@/components/commission-audit/ClientsManager';

export const metadata = {
  title: 'Clients — Zed Automation Commission Audit',
  description: 'Manage brokerages, their audit history and read-only client links.',
};

/** `/clients` — the multi-client management section of the audit suite. */
export default function ClientsPage() {
  return <ClientsManager />;
}
