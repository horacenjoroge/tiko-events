// src/components/QueryProvider.tsx
'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create the query client inside the component to avoid SSR issues
let queryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 30, // 30 minutes (replaces cacheTime in newer versions)
          retry: (failureCount, error: any) => {
            // Don't retry on 4xx errors except 408, 429
            if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
              return false;
            }
            return failureCount < 3;
          },
          refetchOnWindowFocus: false,
          refetchOnReconnect: 'always',
        },
        mutations: {
          retry: (failureCount, error: any) => {
            // Don't retry client errors
            if (error?.status >= 400 && error?.status < 500) {
              return false;
            }
            return failureCount < 2;
          },
        },
      },
    });
  }
  return queryClient;
}

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const client = getQueryClient();

  return (
    <QueryClientProvider client={client}>
      {children}
      {/* React Query DevTools - Development only */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}