import { screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mockUseQueryResult, renderWithQueryClient } from '@/test/query-test-utils'
import type { ApiOccasionType } from '@/data-access/occasion-types/occasion-types.schemas'

vi.mock('@/features/occasion-types/hooks/use-occasion-types', () => ({
  useOccasionTypes: vi.fn(),
}))

import { useOccasionTypes } from '@/features/occasion-types/hooks/use-occasion-types'
import { OccasionTypesList } from './occasion-types-list'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('OccasionTypesList', () => {
  it('renders column headers', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(
      mockUseQueryResult<ApiOccasionType[]>({ data: [] }),
    )
    renderWithQueryClient(<OccasionTypesList />)
    expect(screen.getByText('Emoji')).toBeInTheDocument()
    expect(screen.getByText('Label')).toBeInTheDocument()
    expect(screen.getByText('Slug')).toBeInTheDocument()
    expect(screen.getByText('ID')).toBeInTheDocument()
  })

  it('renders occasion type rows with data', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(
      mockUseQueryResult<ApiOccasionType[]>({
        data: [
          { id: '1', slug: 'birthday', label: 'Birthday', emoji: '🎂' },
          { id: '2', slug: 'wedding', label: 'Wedding', emoji: '💍' },
        ],
      }),
    )
    renderWithQueryClient(<OccasionTypesList />)
    expect(screen.getByText('Birthday')).toBeInTheDocument()
    expect(screen.getByText('birthday')).toBeInTheDocument()
    expect(screen.getByText('🎂')).toBeInTheDocument()
    expect(screen.getByText('Wedding')).toBeInTheDocument()
  })

  it('renders — for null emoji', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(
      mockUseQueryResult<ApiOccasionType[]>({
        data: [{ id: '1', slug: 'other', label: 'Other', emoji: null }],
      }),
    )
    renderWithQueryClient(<OccasionTypesList />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows empty state message when list is empty', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(
      mockUseQueryResult<ApiOccasionType[]>({ data: [] }),
    )
    renderWithQueryClient(<OccasionTypesList />)
    expect(screen.getByText('No occasion types found.')).toBeInTheDocument()
  })

  it('renders skeleton rows while loading', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(
      mockUseQueryResult<ApiOccasionType[]>({ isLoading: true }),
    )
    renderWithQueryClient(<OccasionTypesList />)
    expect(screen.queryByText('No occasion types found.')).not.toBeInTheDocument()
    expect(screen.queryByText('Birthday')).not.toBeInTheDocument()
  })

  it('renders error message on fetch failure', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(
      mockUseQueryResult<ApiOccasionType[]>({ error: new Error('Failed to load') }),
    )
    renderWithQueryClient(<OccasionTypesList />)
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })
})
