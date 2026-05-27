import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://craq.app';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/profile/edit'] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
