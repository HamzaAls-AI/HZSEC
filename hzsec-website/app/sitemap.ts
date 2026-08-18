import { MetadataRoute } from 'next';

const BASE = 'https://www.hzsec.io';

function url(path: string, priority: number, changeFreq: MetadataRoute.Sitemap[0]['changeFrequency'] = 'monthly'): MetadataRoute.Sitemap[0] {
  return { url: `${BASE}${path}`, lastModified: new Date(), changeFrequency: changeFreq, priority };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    url('/',                           1.0, 'weekly'),
    url('/pricing',                    0.9, 'weekly'),
    url('/download',                   0.9, 'monthly'),
    url('/check',                      0.8, 'monthly'),
    url('/demo',                       0.7, 'monthly'),

    url('/product/scan',               0.8, 'monthly'),
    url('/product/defend',             0.8, 'monthly'),
    url('/product/govern',             0.8, 'monthly'),

    url('/docs',                       0.8, 'weekly'),
    url('/docs/quickstart',            0.8, 'weekly'),
    url('/docs/install',               0.7, 'monthly'),
    url('/docs/first-scan',            0.7, 'monthly'),
    url('/docs/cli',                   0.7, 'monthly'),
    url('/docs/ai-assistant',          0.7, 'monthly'),
    url('/docs/live-monitor',          0.7, 'monthly'),
    url('/docs/scan-modes',            0.7, 'monthly'),
    url('/docs/compliance',            0.7, 'monthly'),
    url('/docs/architecture',          0.6, 'monthly'),

    url('/blog',                       0.7, 'weekly'),
    url('/blog/secrets-developers-commit', 0.6, 'monthly'),

    url('/about',                      0.6, 'monthly'),
    url('/changelog',                  0.6, 'weekly'),
    url('/faq',                        0.6, 'monthly'),
    url('/security',                   0.6, 'monthly'),
    url('/guide',                      0.6, 'monthly'),

    url('/legal/privacy',              0.3, 'yearly'),
    url('/legal/terms',                0.3, 'yearly'),
    url('/legal/eula',                 0.3, 'yearly'),
  ];
}
