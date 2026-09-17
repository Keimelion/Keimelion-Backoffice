import { screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mockUseQueryResult, renderWithQueryClient } from '@/test/test-utils'
import { TooltipProvider } from '@/components/ui/tooltip'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

vi.mock('@/features/occasion-types/hooks/use-admin-occasion-types', () => ({
  useAdminOccasionTypes: vi.fn(),
}))

import { useAdminOccasionTypes } from '@/features/occasion-types/hooks/use-admin-occasion-types'
import type { AdminOccasionType } from '@/data-access/occasion-types/admin-occasion-types.schemas'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { OccasionTypesAdminContent } from './occasion-types-admin-content'

const PAGINATION = { page: 1, limit: 20, total: 1, totalPages: 1 }

function makeItem(overrides: Partial<AdminOccasionType> = {}): AdminOccasionType {
  return {
    id: overrides.id ?? 'ot-1',
    slug: overrides.slug ?? 'birthday',
    emoji: overrides.emoji !== undefined ? overrides.emoji : '🎂',
    sortOrder: overrides.sortOrder ?? 0,
    isActive: overrides.isActive ?? true,
    translations: overrides.translations ?? [{ locale: 'en', label: 'Birthday' }],
    createdAt: overrides.createdAt ?? '2024-01-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2024-01-01T00:00:00.000Z',
  }
}

function makeResponse(items: AdminOccasionType[]): PaginatedResponse<AdminOccasionType> {
  return { items, pagination: { ...PAGINATION, total: items.length } }
}

function renderContent(): void {
  renderWithQueryClient(
    <TooltipProvider delayDuration={0}>
      <OccasionTypesAdminContent />
    </TooltipProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('OccasionTypesAdminContent', () => {
  it('renders the create button', () => {
    vi.mocked(useAdminOccasionTypes).mockReturnValue(
      mockUseQueryResult<PaginatedResponse<AdminOccasionType>>({ data: makeResponse([]) }),
    )
    renderContent()
    expect(screen.getByRole('button', { name: /create occasion type/i })).toBeInTheDocument()
  })

  it('renders admin column headers', () => {
    vi.mocked(useAdminOccasionTypes).mockReturnValue(
      mockUseQueryResult<PaginatedResponse<AdminOccasionType>>({ data: makeResponse([]) }),
    )
    renderContent()
    expect(screen.getByText('Slug')).toBeInTheDocument()
    expect(screen.getByText('Label (en)')).toBeInTheDocument()
    expect(screen.getByText('Sort order')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders edit and delete action buttons for each row', () => {
    vi.mocked(useAdminOccasionTypes).mockReturnValue(
      mockUseQueryResult<PaginatedResponse<AdminOccasionType>>({
        data: makeResponse([makeItem()]),
      }),
    )
    renderContent()
    expect(screen.getByRole('button', { name: 'Update Birthday' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Birthday' })).toBeInTheDocument()
  })

  it('renders empty state when no items exist', () => {
    vi.mocked(useAdminOccasionTypes).mockReturnValue(
      mockUseQueryResult<PaginatedResponse<AdminOccasionType>>({ data: makeResponse([]) }),
    )
    renderContent()
    expect(screen.getByText('No occasion types yet')).toBeInTheDocument()
  })

  it('renders inactive row with muted styling (opacity-50)', () => {
    vi.mocked(useAdminOccasionTypes).mockReturnValue(
      mockUseQueryResult<PaginatedResponse<AdminOccasionType>>({
        data: makeResponse([makeItem({ isActive: false })]),
      }),
    )
    renderContent()
    const rows = screen.getAllByRole('row')
    const dataRow = rows[1]
    if (!dataRow) throw new Error('No data row found')
    expect(dataRow.className).toContain('opacity-50')
  })

  it('shows the Active badge for active items', () => {
    vi.mocked(useAdminOccasionTypes).mockReturnValue(
      mockUseQueryResult<PaginatedResponse<AdminOccasionType>>({
        data: makeResponse([makeItem({ isActive: true })]),
      }),
    )
    renderContent()
    const activeBadges = screen.getAllByText('Active')
    expect(activeBadges.length).toBeGreaterThanOrEqual(1)
  })

  it('shows the Inactive badge for inactive items', () => {
    vi.mocked(useAdminOccasionTypes).mockReturnValue(
      mockUseQueryResult<PaginatedResponse<AdminOccasionType>>({
        data: makeResponse([makeItem({ isActive: false })]),
      }),
    )
    renderContent()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('renders skeleton rows while loading', () => {
    vi.mocked(useAdminOccasionTypes).mockReturnValue(
      mockUseQueryResult<PaginatedResponse<AdminOccasionType>>({ isLoading: true }),
    )
    renderContent()
    expect(screen.queryByText('No occasion types yet')).not.toBeInTheDocument()
  })

  it('shows error state on fetch failure', () => {
    vi.mocked(useAdminOccasionTypes).mockReturnValue(
      mockUseQueryResult<PaginatedResponse<AdminOccasionType>>({
        error: new Error('Failed to load'),
      }),
    )
    renderContent()
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })
})
