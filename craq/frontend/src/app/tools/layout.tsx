import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Tools - Craq',
  description:
    'Discover curated business tools organized by category to help solve your challenges.',
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
