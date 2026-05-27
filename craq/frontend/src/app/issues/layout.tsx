import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Issues Feed - Craq',
  description:
    'Browse and discover business challenges shared by entrepreneurs. Find solutions and contribute your expertise.',
};

export default function IssuesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
