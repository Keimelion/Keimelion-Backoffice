import type { ReactElement } from 'react'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'
import { ListItemsSubTable } from './list-items-sub-table'

function render(ui: ReactElement): void {
  renderWithQueryClient(ui)
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

vi.mock('@/features/lists/hooks/use-admin-list-items', () => ({
  useAdminListItems: vi.fn(),
}))

import { useAdminListItems } from '@/features/lists/hooks/use-admin-list-items'

type UseAdminListItemsReturn = ReturnType<typeof useAdminListItems>

const LIST_ID = '11111111-1111-4111-8111-111111111111'

function listItemWithPrices(prices: (string | null)[]): {
  id: string
  listId: string
  itemId: string
  quantityDesired: number
  quantityReservedTotal: number
  itemStatus: string
  sortOrder: number | null
  creatorNote: string | null
  createdAt: string
  updatedAt: string
  item: {
    id: string
    name: string
    description: string | null
    imageUrl: string | null
    createdByUserId: string | null
    createdAt: string
    updatedAt: string
  }
  sources: {
    id: string
    itemId: string
    shopId: string | null
    shop: null
    sourceUrl: string | null
    price: string | null
    currency: string
    createdAt: string
    updatedAt: string
  }[]
} {
  return {
    id: 'li-1',
    listId: LIST_ID,
    itemId: 'item-1',
    quantityDesired: 2,
    quantityReservedTotal: 0,
    itemStatus: 'active',
    sortOrder: 0,
    creatorNote: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    item: {
      id: 'item-1',
      name: 'Weighted blanket',
      description: 'Cozy and warm',
      imageUrl: null,
      createdByUserId: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
    sources: prices.map((price, index) => ({
      id: `src-${String(index)}`,
      itemId: 'item-1',
      shopId: null,
      shop: null,
      sourceUrl: 'https://example.com/p',
      price,
      currency: 'EUR',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    })),
  }
}

function mockListItemsResult(data: ReturnType<typeof listItemWithPrices>[]): void {
  vi.mocked(useAdminListItems).mockReturnValue({
    data: {
      items: data,
      pagination: { page: 1, limit: 20, total: data.length, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as unknown as UseAdminListItemsReturn)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ListItemsSubTable', () => {
  it('does not call the fetch hook until the component is mounted (mount-only-on-expand)', () => {
    mockListItemsResult([])
    expect(useAdminListItems).not.toHaveBeenCalled()
    render(<ListItemsSubTable listId={LIST_ID} />)
    expect(useAdminListItems).toHaveBeenCalledWith(LIST_ID, { page: 1, limit: 20 })
  })

  it('computes the average price across priced sources only (ignores null prices)', () => {
    mockListItemsResult([listItemWithPrices(['10.00', null, '20.00'])])
    render(<ListItemsSubTable listId={LIST_ID} />)
    expect(screen.getByText(/€15\.00/)).toBeInTheDocument()
  })

  it('shows the empty-price state when no source has a non-null price', () => {
    mockListItemsResult([listItemWithPrices([null, null])])
    render(<ListItemsSubTable listId={LIST_ID} />)
    expect(screen.getByText('No priced source')).toBeInTheDocument()
  })

  it('renders the empty state when the list has no items', () => {
    mockListItemsResult([])
    render(<ListItemsSubTable listId={LIST_ID} />)
    expect(screen.getByText('This list has no items yet.')).toBeInTheDocument()
  })

  it('renders item name, description and quantity', () => {
    mockListItemsResult([listItemWithPrices(['10.00'])])
    render(<ListItemsSubTable listId={LIST_ID} />)
    expect(screen.getByText('Weighted blanket')).toBeInTheDocument()
    expect(screen.getByText('Cozy and warm')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders a retry button on error', () => {
    vi.mocked(useAdminListItems).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Boom'),
      refetch: vi.fn(),
    } as unknown as UseAdminListItemsReturn)
    render(<ListItemsSubTable listId={LIST_ID} />)
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    expect(screen.getByText('Boom')).toBeInTheDocument()
  })
})
