import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // This is similar behavior to our custom usePromise hook.
      // It can be overridden on an individual basis, if needed.
      keepPreviousData: true,
      // We presume data will not go stale during the lifecycle of an application.
      staleTime: Infinity,
      // Do not attempt to retry if an error is encountered
      retry: false,
      // Do not referch when the browser tab is focused again
      refetchOnWindowFocus: false,
    },
  },
});
