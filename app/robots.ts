import type { MetadataRoute } from 'next';
import {
  PRIVATE_DISALLOWED_PATHS,
  SITE_BASE_URL,
} from '@/lib/commission-audit/landing-proof';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...PRIVATE_DISALLOWED_PATHS],
      },
    ],
    sitemap: `${SITE_BASE_URL}/sitemap.xml`,
    host: SITE_BASE_URL,
  };
}
