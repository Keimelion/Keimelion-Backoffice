import { MutationCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiRequestError } from './api-client'

const STALE_TIME_MS = 1000 * 60 * 5
const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.'

interface MutationMeta {
  silent?: boolean
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const meta = mutation.options.meta as MutationMeta | undefined
        if (meta?.silent === true) return
        const message = error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE
        toast.error(message)
      },
    }),
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
}

export const queryClient = createQueryClient()
