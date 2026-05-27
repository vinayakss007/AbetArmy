import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search - Craq',
  description:
    'Search issues, solutions, and tools across the Craq platform.',
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
