import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Profile - Craq',
  description:
    'Update your profile information, skills, and industry preferences.',
};

export default function EditProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
