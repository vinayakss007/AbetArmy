import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Craq',
  description:
    'Join the Craq community of entrepreneurs solving business problems together.',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
