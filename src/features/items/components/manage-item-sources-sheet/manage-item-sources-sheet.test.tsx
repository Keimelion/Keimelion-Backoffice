import type { ReactElement } from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ManageItemSourcesSheet } from './manage-item-sources-sheet'

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
  useAdminItem: vi.fn(),
}))

vi.mock('@/features/items/hooks/use-item-source-mutations', () => ({
  useCreateItemSource: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateItemSource: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteItemSource: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('@/features/shops/hooks/use-admin-shops', () => ({
  useAdminShops: () => ({ data: { items: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } }, isLoading: false }),
}))

import { useAdminItem } from '@/features/items/hooks/use-admin-items'

const MOCK_SOURCE_A = {
  id: 'src-a',
  itemId: 'item-1',
  shopId: null,
  shop: null,
  sourceUrl: 'https://example.com/a',
  price: '19.99',
  currency: 'EUR',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const MOCK_SOURCE_B = {
  id: 'src-b',
  itemId: 'item-1',
  shopId: null,
  shop: null,
  sourceUrl: 'https://example.com/b',
  price: '29.99',
  currency: 'EUR',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const MOCK_ITEM = {
  id: 'item-1',
  name: 'Weighted blanket',
  description: null,
  imageUrl: null,
  createdByUserId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  sources: [MOCK_SOURCE_A, MOCK_SOURCE_B],
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useAdminItem).mockReturnValue({ data: MOCK_ITEM, isLoading: false } as ReturnType<typeof useAdminItem>)
})

describe('ManageItemSourcesSheet', () => {
  it('renders the sheet title with the item name', () => {
    render(<ManageItemSourcesSheet open onOpenChange={vi.fn()} item={MOCK_ITEM} />)
    expect(screen.getByText('Sources for Weighted blanket')).toBeInTheDocument()
  })

  it('renders every source row with its URL', () => {
    render(<ManageItemSourcesSheet open onOpenChange={vi.fn()} item={MOCK_ITEM} />)
    expect(screen.getByText('https://example.com/a')).toBeInTheDocument()
    expect(screen.getByText('https://example.com/b')).toBeInTheDocument()
  })

  it('opens the Add source dialog when the toolbar button is clicked', async () => {
    render(<ManageItemSourcesSheet open onOpenChange={vi.fn()} item={MOCK_ITEM} />)
    await userEvent.click(screen.getByRole('button', { name: /^add source$/i }))
    expect(screen.getByRole('heading', { name: /add source/i })).toBeInTheDocument()
  })

  it('disables the delete row action when only one source remains', () => {
    const singleSource = { ...MOCK_ITEM, sources: [MOCK_SOURCE_A] }
    vi.mocked(useAdminItem).mockReturnValue({ data: singleSource, isLoading: false } as ReturnType<typeof useAdminItem>)
    render(<ManageItemSourcesSheet open onOpenChange={vi.fn()} item={singleSource} />)
    const deleteButton = screen.getByRole('button', { name: /at least one source is required/i })
    expect(deleteButton).toBeDisabled()
  })
})
