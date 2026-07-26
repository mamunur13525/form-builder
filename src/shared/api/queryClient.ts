import { QueryClient } from "@tanstack/react-query"

/**
 * Shared TanStack Query client.
 *
 * - `staleTime` 5 min: data is considered fresh for 5 minutes before refetching.
 * - `gcTime` 10 min: unused cached data is garbage-collected after 10 minutes.
 * - `retry` 1: failed queries retry once (network flakiness).
 * - `refetchOnWindowFocus` false: avoid surprising refetches when the user
 *   switches back to the tab.
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
        },
        mutations: {
            retry: 0,
        },
    },
})
