import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://craq.app';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchPublishedIssues(): Promise<{ id: string; updatedAt?: string }[]> {
  try {
    const res = await fetch(`${apiUrl}/api/issues?limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const issues = data.issues || data.data || [];
    return issues.map((issue: { id: string; updated_at?: string }) => ({
      id: issue.id,
      updatedAt: issue.updated_at,
    }));
  } catch {
    // API may not be available at build time; fall back to static routes only
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/issues`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  const issues = await fetchPublishedIssues();
  const issueRoutes: MetadataRoute.Sitemap = issues.map((issue) => ({
    url: `${baseUrl}/issues/${issue.id}`,
    lastModified: issue.updatedAt ? new Date(issue.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...issueRoutes];
}
