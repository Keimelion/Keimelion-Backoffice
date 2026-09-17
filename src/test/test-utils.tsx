import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import {
  QueryClient,
  QueryClientProvider,
  type UseQueryResult,
} from '@tanstack/react-query'
import type { ComponentType, ReactElement, ReactNode } from 'react'
import { IntlProvider } from 'react-intl'
import { vi } from 'vitest'
import { enMessages } from '@/lib/i18n/messages/en'

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

interface WrapperProps {
  children: ReactNode
}

export function createIntlWrapper(): ComponentType<WrapperProps> {
  return function IntlWrapper({ children }: WrapperProps): React.JSX.Element {
    return (
      <IntlProvider locale="en" messages={enMessages} defaultLocale="en">
        {children}
      </IntlProvider>
    )
  }
}

export function renderWithIntl(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return render(ui, { wrapper: createIntlWrapper(), ...options })
}

export function createQueryClientWrapper(): ComponentType<WrapperProps> {
  const client = createTestQueryClient()
  return function QueryClientWrapper({ children }: WrapperProps): React.JSX.Element {
    return (
      <IntlProvider locale="en" messages={enMessages} defaultLocale="en">
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </IntlProvider>
    )
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
