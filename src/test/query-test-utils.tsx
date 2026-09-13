import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import {
  QueryClient,
  QueryClientProvider,
  type UseQueryResult,
} from '@tanstack/react-query'
import type { ComponentType, ReactElement, ReactNode } from 'react'
import { vi } from 'vitest'

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

interface QueryClientWrapperProps {
  children: ReactNode
}

export function createQueryClientWrapper(): ComponentType<QueryClientWrapperProps> {
  const client = createTestQueryClient()
  return function QueryClientWrapper({
    children,
  }: QueryClientWrapperProps): React.JSX.Element {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

export function renderWithQueryClient(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return render(ui, { wrapper: createQueryClientWrapper(), ...options })
}

interface MockUseQueryResultInput<TData> {
  data?: TData
  isLoading?: boolean
  error?: Error | null
}

export function mockUseQueryResult<TData>({
  data,
  isLoading = false,
  error = null,
}: MockUseQueryResultInput<TData>): UseQueryResult<TData> {
  const isError = error !== null
  const isSuccess = !isLoading && !isError && data !== undefined
  const status = isError ? 'error' : isLoading ? 'pending' : 'success'
  return {
    data: isSuccess ? data : undefined,
    error,
    isError,
    isLoading,
    isPending: isLoading,
    isSuccess,
    isFetching: isLoading,
    isRefetching: false,
    fetchStatus: isLoading ? 'fetching' : 'idle',
    status,
    refetch: vi.fn(),
  } as unknown as UseQueryResult<TData>
}
