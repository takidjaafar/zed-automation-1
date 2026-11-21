import type { MetadataRoute } from 'next';
import { SITE_BASE_URL } from '@/lib/commission-audit/landing-proof';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
