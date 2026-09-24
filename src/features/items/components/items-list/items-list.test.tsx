import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mockUseQueryResult, renderWithQueryClient } from '@/test/test-utils'
import { TooltipProvider } from '@/components/ui/tooltip'

const useSearchParamsMock = vi.fn(() => new URLSearchParams())
const replaceMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => useSearchParamsMock(),
}))

vi.mock('@/features/items/hooks/use-items', () => ({
  useItems: vi.fn(),
}))

import { useItems } from '@/features/items/hooks/use-items'
import { ItemsList } from './items-list'

const PAGINATION = { page: 1, limit: 20, total: 1, totalPages: 1 }

function makeItem(overrides: Partial<{
  id: string
  name: string
  moderationStatus: 'approved' | 'pending' | 'rejected'
  imageUrl: string | null
  deletedAt: string | null
}> = {}) {
  return {
    id: overrides.id ?? 'item-1',
    name: overrides.name ?? 'Espresso machine',
    description: null,
    imageUrl: overrides.imageUrl ?? null,
    moderationStatus: overrides.moderationStatus ?? ('approved' as const),
    createdByUserId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    deletedAt: overrides.deletedAt ?? null,
  }
}

function makeItemsData(items: ReturnType<typeof makeItem>[]) {
  return { items, pagination: { ...PAGINATION, total: items.length, totalPages: 1 } }
}

function renderList(): void {
  renderWithQueryClient(
    <TooltipProvider delayDuration={0}>
      <ItemsList />
    </TooltipProvider>,
  )
}

function firstDataRow(): HTMLElement {
  const rows = screen.getAllByRole('row')
  const row = rows[1]
  if (row === undefined) throw new Error('No data row rendered')
  return row
}

beforeEach(() => {
  vi.clearAllMocks()
  useSearchParamsMock.mockReturnValue(new URLSearchParams())
})

describe('ItemsList', () => {
  it('renders item rows with name and moderation status badge', () => {
    vi.mocked(useItems).mockReturnValue(mockUseQueryResult({ data: makeItemsData([makeItem()]) }))
    renderList()
    expect(within(firstDataRow()).getByText('Espresso machine')).toBeInTheDocument()
    expect(within(firstDataRow()).getByText('Approved')).toBeInTheDocument()
  })

  it('shows the empty state when no items match the filters', () => {
    vi.mocked(useItems).mockReturnValue(mockUseQueryResult({ data: makeItemsData([]) }))
    renderList()
    expect(screen.getByText('No items match these filters.')).toBeInTheDocument()
  })

  it('shows Edit and Delete actions for a live item', () => {
    vi.mocked(useItems).mockReturnValue(mockUseQueryResult({ data: makeItemsData([makeItem()]) }))
    renderList()
    expect(screen.getByRole('button', { name: 'Update Espresso machine' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Espresso machine' })).toBeInTheDocument()
  })

  it('shows a Restore action instead of Edit/Delete for a soft-deleted item', () => {
    vi.mocked(useItems).mockReturnValue(
      mockUseQueryResult({ data: makeItemsData([makeItem({ deletedAt: '2024-06-01T00:00:00.000Z' })]) }),
    )
    renderList()
    expect(screen.getByRole('button', { name: 'Restore Espresso machine' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Update Espresso machine' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete Espresso machine' })).not.toBeInTheDocument()
  })

  it('renders the Create item button', () => {
    vi.mocked(useItems).mockReturnValue(mockUseQueryResult({ data: makeItemsData([]) }))
    renderList()
    expect(screen.getByRole('button', { name: /create item/i })).toBeInTheDocument()
  })

  describe('sortable columns', () => {
    beforeEach(() => {
      vi.mocked(useItems).mockReturnValue(mockUseQueryResult({ data: makeItemsData([makeItem()]) }))
    })

    it('name column header renders as a sort button', () => {
      renderList()
      expect(screen.getByRole('button', { name: /sort by name/i })).toBeInTheDocument()
    })

    it('created column header renders as a sort button', () => {
      renderList()
      expect(screen.getByRole('button', { name: /sort by created/i })).toBeInTheDocument()
    })

    it('updated column header renders as a sort button', () => {
      renderList()
      expect(screen.getByRole('button', { name: /sort by updated/i })).toBeInTheDocument()
    })

    it('moderation column header renders as a sort button', () => {
      renderList()
      expect(screen.getByRole('button', { name: /sort by moderation/i })).toBeInTheDocument()
    })

    it('image column header does not render as a sort button', () => {
      renderList()
      expect(screen.queryByRole('button', { name: /sort by image/i })).not.toBeInTheDocument()
    })
  })

  it('renders the name filter input', () => {
    vi.mocked(useItems).mockReturnValue(mockUseQueryResult({ data: makeItemsData([]) }))
    renderList()
    expect(screen.getByPlaceholderText('Search by name…')).toBeInTheDocument()
  })

  it('renders a moderation status filter toggle for each status', () => {
    vi.mocked(useItems).mockReturnValue(mockUseQueryResult({ data: makeItemsData([]) }))
    renderList()
    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })

  it('does not show a deletedAt column when show-deleted is off', () => {
    vi.mocked(useItems).mockReturnValue(mockUseQueryResult({ data: makeItemsData([makeItem()]) }))
    renderList()
    expect(screen.queryByText('Deleted')).not.toBeInTheDocument()
  })

  it('shows a deletedAt column when show-deleted is toggled on via the URL', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams({ includeDeleted: 'true' }))
    vi.mocked(useItems).mockReturnValue(
      mockUseQueryResult({ data: makeItemsData([makeItem({ deletedAt: '2024-06-01T00:00:00.000Z' })]) }),
    )
    renderList()
    expect(screen.getByText('Deleted')).toBeInTheDocument()
  })
})
