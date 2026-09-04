import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiRequestError } from '@/data-access/_client'
import { clearAccessToken, clearStoredUser } from '@/features/auth/auth-storage'

const STALE_TIME_MS = 1000 * 60 * 5
const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.'

interface MutationMeta {
  silent?: boolean
  skipUnauthorizedRedirect?: boolean
}

let redirectInFlight = false

function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 401
}

function handleUnauthorized(client: QueryClient): void {
  if (redirectInFlight) return
  redirectInFlight = true
  clearAccessToken()
  clearStoredUser()
  client.clear()
  window.location.assign('/login')
}

export function createQueryClient(): QueryClient {
  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (isUnauthorized(error)) {
          handleUnauthorized(client)
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const meta = mutation.options.meta as MutationMeta | undefined

        if (isUnauthorized(error) && meta?.skipUnauthorizedRedirect !== true) {
          handleUnauthorized(client)
          return
        }

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
  return client
}

export const queryClient = createQueryClient()
