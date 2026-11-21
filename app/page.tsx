import LandingClientShell from '@/components/landing/LandingClientShell';
import {
  EXECUTIVE_FAQ_ITEMS,
  SITE_BASE_URL,
} from '@/lib/commission-audit/landing-proof';

const STRUCTURED_DATA = [
  {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Zed Automation',
    url: SITE_BASE_URL,
    email: 'zakaria@zedautomations.tech',
    description:
      'Forensic real estate commission audit and brokerage GCI leakage recovery delivered asynchronously within 48 hours.',
    areaServed: 'US',
    serviceType: 'Real Estate Forensic Commission Audit',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: EXECUTIVE_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <LandingClientShell />
    </>
  );
}
