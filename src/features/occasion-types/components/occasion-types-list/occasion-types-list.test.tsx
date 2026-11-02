import { screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mockUseQueryResult, renderWithQueryClient } from '@/test/test-utils'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { ApiOccasionType } from '@/data-access/occasion-types/occasion-types.schemas'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/features/occasion-types/hooks/use-occasion-types', () => ({
  useOccasionTypes: vi.fn(),
}))

import { useOccasionTypes } from '@/features/occasion-types/hooks/use-occasion-types'
import { OccasionTypesList } from './occasion-types-list'

function renderList(): void {
  renderWithQueryClient(
    <TooltipProvider delayDuration={0}>
      <OccasionTypesList />
    </TooltipProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('OccasionTypesList', () => {
  it('renders column headers', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(
      mockUseQueryResult<ApiOccasionType[]>({ data: [] }),
    )
    renderList()
    expect(screen.getByText('Emoji')).toBeInTheDocument()
    expect(screen.getByText('Label')).toBeInTheDocument()
    expect(screen.getByText('Slug')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
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
    renderList()
    expect(screen.getByText('Birthday')).toBeInTheDocument()
    expect(screen.getByText('birthday')).toBeInTheDocument()
    expect(screen.getByText('🎂')).toBeInTheDocument()
    expect(screen.getByText('Wedding')).toBeInTheDocument()
  })

  it('renders row-specific edit and delete action buttons', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(
      mockUseQueryResult<ApiOccasionType[]>({
        data: [
          { id: '1', slug: 'birthday', label: 'Birthday', emoji: '🎂' },
          { id: '2', slug: 'wedding', label: 'Wedding', emoji: '💍' },
        ],
      }),
    )
    renderList()
    expect(screen.getByRole('button', { name: 'Update Birthday' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Birthday' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update Wedding' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Wedding' })).toBeInTheDocument()
  })

  it('renders — for null emoji', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(
      mockUseQueryResult<ApiOccasionType[]>({
        data: [{ id: '1', slug: 'other', label: 'Other', emoji: null }],
      }),
    )
    renderList()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows empty state message when list is empty', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(
      mockUseQueryResult<ApiOccasionType[]>({ data: [] }),
    )
    renderList()
    expect(screen.getByText('No occasion types found.')).toBeInTheDocument()
  })

  it('renders skeleton rows while loading', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(
      mockUseQueryResult<ApiOccasionType[]>({ isLoading: true }),
    )
    renderList()
    expect(screen.queryByText('No occasion types found.')).not.toBeInTheDocument()
    expect(screen.queryByText('Birthday')).not.toBeInTheDocument()
  })

  it('renders error message on fetch failure', () => {
    vi.mocked(useOccasionTypes).mockReturnValue(
      mockUseQueryResult<ApiOccasionType[]>({ error: new Error('Failed to load') }),
    )
    renderList()
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })
})
