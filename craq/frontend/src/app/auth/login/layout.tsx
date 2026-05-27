import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - Craq',
  description:
    'Sign in to your Craq account to participate in discussions and share solutions.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
