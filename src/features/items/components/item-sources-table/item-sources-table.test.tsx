import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

vi.mock('@/features/items/hooks/use-item-sources', () => ({
  useItemSources: vi.fn(),
}))

vi.mock('@/features/shops/hooks/use-shops', () => ({
  useShops: vi.fn(),
}))

const mutateMock = vi.fn()
vi.mock('@/features/items/hooks/use-item-source-mutations', () => ({
  useUpdateItemSource: () => ({ mutate: mutateMock, isPending: false }),
  useCreateItemSource: vi.fn(),
  useDeleteItemSource: vi.fn(),
}))

import { useItemSources } from '@/features/items/hooks/use-item-sources'
import { useShops } from '@/features/shops/hooks/use-shops'
import { ItemSourcesTable } from './item-sources-table'

function makeSource(overrides: Partial<{
  id: string
  shopId: string | null
  sourceUrl: string | null
  price: string | null
  currency: string
  isPrimary: boolean
}> = {}) {
  return {
    id: overrides.id ?? 'source-1',
    itemId: 'item-1',
    shopId: overrides.shopId ?? null,
    sourceUrl: overrides.sourceUrl ?? 'https://shop.example.com/product',
    price: overrides.price ?? '19.99',
    currency: overrides.currency ?? 'EUR',
    isPrimary: overrides.isPrimary ?? false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }
}

function renderTable(isLocked = false): void {
  renderWithQueryClient(
    <TooltipProvider delayDuration={0}>
      <ItemSourcesTable itemId="item-1" isLocked={isLocked} />
    </TooltipProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useShops).mockReturnValue(
    mockUseQueryResult({ data: [{ id: 'shop-1', name: 'Amazon' }] }) as ReturnType<typeof useShops>,
  )
})

describe('ItemSourcesTable', () => {
  it('shows the empty state when there are no sources', () => {
    vi.mocked(useItemSources).mockReturnValue(mockUseQueryResult({ data: [] }))
    renderTable()
    expect(screen.getByText('No sources yet for this item.')).toBeInTheDocument()
  })

  it('renders the source URL as a link with security attributes', () => {
    vi.mocked(useItemSources).mockReturnValue(mockUseQueryResult({ data: [makeSource()] }))
    renderTable()
    const link = screen.getByRole('link', { name: 'https://shop.example.com/product' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer nofollow')
  })

  it('resolves the shop name from the shops list', () => {
    vi.mocked(useItemSources).mockReturnValue(
      mockUseQueryResult({ data: [makeSource({ shopId: 'shop-1' })] }),
    )
    renderTable()
    expect(screen.getByText('Amazon')).toBeInTheDocument()
  })

  it('shows a dash when the source has no shop', () => {
    vi.mocked(useItemSources).mockReturnValue(mockUseQueryResult({ data: [makeSource({ shopId: null })] }))
    renderTable()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('marks the primary source radio as checked', () => {
    vi.mocked(useItemSources).mockReturnValue(
      mockUseQueryResult({ data: [makeSource({ id: 'source-1', isPrimary: true })] }),
    )
    renderTable()
    expect(screen.getByRole('radio')).toBeChecked()
  })

  it('calls the update mutation with isPrimary=true when a non-primary radio is selected', async () => {
    vi.mocked(useItemSources).mockReturnValue(
      mockUseQueryResult({
        data: [
          makeSource({ id: 'source-1', isPrimary: true }),
          makeSource({ id: 'source-2', sourceUrl: 'https://other.example.com', isPrimary: false }),
        ],
      }),
    )
    renderTable()
    const radios = screen.getAllByRole('radio')
    const secondRadio = radios[1]
    if (secondRadio === undefined) throw new Error('Expected a second radio button')
    await userEvent.click(secondRadio)
    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith({
        itemId: 'item-1',
        sourceId: 'source-2',
        input: {
          shopId: null,
          sourceUrl: 'https://other.example.com',
          price: '19.99',
          currency: 'EUR',
          isPrimary: true,
        },
      })
    })
  })

  it('disables row Edit/Delete actions with a locked tooltip when the item is soft-deleted', () => {
    vi.mocked(useItemSources).mockReturnValue(mockUseQueryResult({ data: [makeSource()] }))
    renderTable(true)
    expect(screen.getAllByRole('button', { name: 'This item is soft-deleted. Restore it to manage its sources.' })).toHaveLength(2)
  })

  it('shows an error state with a retry button on fetch failure', () => {
    vi.mocked(useItemSources).mockReturnValue(mockUseQueryResult({ error: new Error('Network error') }))
    renderTable()
    expect(screen.getByText('Network error')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('does not render a clickable link for a non-https source URL', () => {
    vi.mocked(useItemSources).mockReturnValue(
      mockUseQueryResult({ data: [makeSource({ sourceUrl: 'javascript:alert(1)' })] }),
    )
    renderTable()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('javascript:alert(1)')).toBeInTheDocument()
  })

  it('does not render a clickable link for an http source URL', () => {
    vi.mocked(useItemSources).mockReturnValue(
      mockUseQueryResult({ data: [makeSource({ sourceUrl: 'http://insecure.example.com' })] }),
    )
    renderTable()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('http://insecure.example.com')).toBeInTheDocument()
  })
})
