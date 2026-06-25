import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const LOCALES = ['uk', 'no', 'sv', 'pl'];

const STATIC_PATHS = ['', '/trips', '/parcels', '/privacy', '/terms'];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1.0 : 0.8,
      });
    }
  }

  return entries;
}
