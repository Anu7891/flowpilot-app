import { ReactNode } from 'react';
import './globals.css';
import './ds.css';
import './landing.css';
import './flow.css';
import './workspace.css';
import IconSprite from '@/components/IconSprite';
import QueryProvider from '@/components/providers/QueryProvider';

export const metadata = {
  title: 'FlowPilot — Plan smarter. Build faster. Deliver with confidence.',
  description:
    'FlowPilot is the AI-powered project management platform for modern software teams.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <IconSprite />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
