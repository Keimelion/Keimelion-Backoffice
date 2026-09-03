import { QueryClient } from '@tanstack/react-query'
import { ApiRequestError } from './api-client'

const STALE_TIME_MS = 1000 * 60 * 5

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      retry: (failureCount, error) => {
        if (error instanceof ApiRequestError && error.status < 500) {
          return false
        }
        return failureCount < 2
      },
    },
  },
})
