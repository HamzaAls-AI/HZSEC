import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/welcome',
          '/api/',
          '/login/',
          '/signup/',
          '/sample',
        ],
      },
    ],
    sitemap: 'https://www.hzsec.io/sitemap.xml',
  };
}
