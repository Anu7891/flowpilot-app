'use client';
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { ToastProvider } from './ui';

export default function AppShell({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="pg-flow pg-ws shell">
        <Sidebar slug={slug} />
        <main className="main">{children}</main>
      </div>
    </ToastProvider>
  );
}
