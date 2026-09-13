import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/features/occasion-types/hooks/use-occasion-types', () => ({
  useOccasionTypes: vi.fn(),
}))

import { useOccasionTypes } from '@/features/occasion-types/hooks/use-occasion-types'
import { OccasionTypesList } from './occasion-types-list'

function makeQueryResult(data: { id: string; slug: string; label: string; emoji: string | null }[]): never {
  return {
    data,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as never
}

function makeLoadingResult(): never {
  return {
    data: undefined,
    isLoading: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as never
}

function makeErrorResult(message: string): never {
  return {
    data: undefined,
    isLoading: false,
    isError: true,
    error: new Error(message),
    refetch: vi.fn(),
  } as never
}

function makeWrapper(): React.ComponentType<{ children: React.ReactNode }> {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

function renderList(): void {
  render(<OccasionTypesList />, { wrapper: makeWrapper() })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('OccasionTypesList', () => {
  it('renders column headers', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(makeQueryResult([]))
    renderList()
    expect(screen.getByText('Emoji')).toBeInTheDocument()
    expect(screen.getByText('Label')).toBeInTheDocument()
    expect(screen.getByText('Slug')).toBeInTheDocument()
    expect(screen.getByText('ID')).toBeInTheDocument()
  })

  it('renders occasion type rows with data', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(
      makeQueryResult([
        { id: '1', slug: 'birthday', label: 'Birthday', emoji: '🎂' },
        { id: '2', slug: 'wedding', label: 'Wedding', emoji: '💍' },
      ]),
    )
    renderList()
    expect(screen.getByText('Birthday')).toBeInTheDocument()
    expect(screen.getByText('birthday')).toBeInTheDocument()
    expect(screen.getByText('🎂')).toBeInTheDocument()
    expect(screen.getByText('Wedding')).toBeInTheDocument()
  })

  it('renders — for null emoji', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(
      makeQueryResult([{ id: '1', slug: 'other', label: 'Other', emoji: null }]),
    )
    renderList()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows empty state message when list is empty', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(makeQueryResult([]))
    renderList()
    expect(screen.getByText('No occasion types found.')).toBeInTheDocument()
  })

  it('renders skeleton rows while loading', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(makeLoadingResult())
    renderList()
    expect(screen.queryByText('No occasion types found.')).not.toBeInTheDocument()
    expect(screen.queryByText('Birthday')).not.toBeInTheDocument()
  })

  it('renders error message on fetch failure', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(makeErrorResult('Failed to load'))
    renderList()
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })
})
