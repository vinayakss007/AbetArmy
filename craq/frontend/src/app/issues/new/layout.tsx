import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post a Problem - Craq',
  description:
    'Share your business challenge and get solutions from experienced entrepreneurs.',
};

export default function NewIssueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
