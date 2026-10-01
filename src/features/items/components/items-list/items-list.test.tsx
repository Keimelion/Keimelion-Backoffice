import type { ReactElement } from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ItemsList } from './items-list'

function render(ui: ReactElement): void {
  renderWithQueryClient(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>)
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

vi.mock('@/features/items/hooks/use-admin-items', () => ({
  useAdminItems: vi.fn(),
  useAdminItem: () => ({ data: undefined, isLoading: false }),
  useCreateItem: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateItem: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteItem: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('@/features/items/hooks/use-item-source-mutations', () => ({
  useCreateItemSource: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateItemSource: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteItemSource: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('@/features/shops/hooks/use-admin-shops', () => ({
  useAdminShops: () => ({ data: { items: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } }, isLoading: false }),
}))

import { useAdminItems } from '@/features/items/hooks/use-admin-items'

const MOCK_SOURCE = {
  id: 'src-1',
  itemId: 'item-1',
  shopId: null,
  shop: null,
  sourceUrl: 'https://example.com/p',
  price: '19.99',
  currency: 'EUR',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const MOCK_ITEM = {
  id: 'item-1',
  name: 'Weighted blanket',
  description: 'Cozy and warm',
  imageUrl: null,
  createdByUserId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  sources: [MOCK_SOURCE],
}

function mockItemsResult(overrides: Partial<ReturnType<typeof buildBaseResult>> = {}): void {
  vi.mocked(useAdminItems).mockReturnValue({ ...buildBaseResult(), ...overrides } as ReturnType<typeof useAdminItems>)
}

function buildBaseResult(): {
  data: { items: typeof MOCK_ITEM[]; pagination: { page: number; limit: number; total: number; totalPages: number } }
  isLoading: boolean
  error: Error | null
  refetch: () => void
} {
  return {
    data: {
      items: [MOCK_ITEM],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ItemsList', () => {
  it('renders items with name, description, source count and timestamps', () => {
    mockItemsResult()
    render(<ItemsList />)
    expect(screen.getByText('Weighted blanket')).toBeInTheDocument()
    expect(screen.getByText('Cozy and warm')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders sortable headers for name, created, updated', () => {
    mockItemsResult()
    render(<ItemsList />)
    expect(screen.getByRole('button', { name: /sort by name/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sort by created/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sort by updated/i })).toBeInTheDocument()
  })

  it('exposes a search filter input and a Create item button', () => {
    mockItemsResult()
    render(<ItemsList />)
    expect(screen.getByPlaceholderText('Search by name…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create item/i })).toBeInTheDocument()
  })

  it('renders the empty state when no items match', () => {
    mockItemsResult({ data: { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } } })
    render(<ItemsList />)
    expect(screen.getByText('No items match these filters.')).toBeInTheDocument()
  })

  it('expands the row inline to show the sources manager when the row is clicked', async () => {
    mockItemsResult()
    render(<ItemsList />)
    const nameCell = screen.getByText('Weighted blanket')
    await userEvent.click(nameCell)
    expect(screen.getByText('https://example.com/p')).toBeInTheDocument()
  })
})
