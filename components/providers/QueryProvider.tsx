'use client';
import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * App-wide React Query provider.
 * One QueryClient per browser tab, created lazily so it survives re-renders
 * but is never shared across requests (SSR-safe).
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 30s -> fewer refetches on navigation.
            staleTime: 30_000,
            // The API already reports auth/permission errors clearly; one retry
            // covers transient network blips without hammering on real 4xx.
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
