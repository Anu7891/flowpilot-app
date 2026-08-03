import { ReactNode } from 'react';
import AppShell from '@/components/ws/AppShell';

export default function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string };
}) {
  return <AppShell slug={params.slug}>{children}</AppShell>;
}
