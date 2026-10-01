import ReadOnlyAuditView from '@/components/commission-audit/ReadOnlyAuditView';

export const metadata = {
  title: 'Commission Audit — Read-only view',
  description: 'Shared, read-only commission audit prepared by Zed Automation.',
};

/**
 * Read-only client view reached from the "Share with Client" link:
 * `/commission-audit/view/[auditId]`.
 */
export default async function SharedAuditPage({
  params,
}: {
  params: Promise<{ auditId: string }>;
}) {
  const { auditId } = await params;
  return <ReadOnlyAuditView auditId={auditId} />;
}
