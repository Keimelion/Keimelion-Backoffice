import { screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mockUseQueryResult, renderWithQueryClient } from '@/test/test-utils'
import { TooltipProvider } from '@/components/ui/tooltip'
import type * as AuthStorageModule from '@/data-access/_shared/auth-storage'

vi.mock('@/data-access/_shared/auth-storage', async (importOriginal) => {
  const actual = await importOriginal<typeof AuthStorageModule>()
  return {
    ...actual,
    getStoredUser: vi.fn(),
  }
})

vi.mock('@/features/items/hooks/use-items', () => ({
  useItem: vi.fn(),
}))

vi.mock('@/features/items/components/item-sources-table', () => ({
  ItemSourcesTable: ({ isLocked }: { isLocked: boolean }) => (
    <div>Sources table rendered (locked={String(isLocked)})</div>
  ),
}))

import { getStoredUser } from '@/data-access/_shared/auth-storage'
import { useItem } from '@/features/items/hooks/use-items'
import { ItemDetailContent } from './item-detail-content'

const ADMIN_USER = {
  id: 'admin-1',
  email: 'admin@keimelion.app',
  username: 'admin',
  authProvider: 'email' as const,
  role: 'admin' as const,
  avatarUrl: null,
  isCgvAccepted: true,
  cgvAcceptedAt: null,
  isMarketingOptedIn: false,
  emailVerifiedAt: null,
  lastActiveAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const VALID_ITEM_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde'

function makeItem(overrides: Partial<{ deletedAt: string | null }> = {}) {
  return {
    id: VALID_ITEM_ID,
    name: 'Espresso machine',
    description: null,
    imageUrl: null,
    moderationStatus: 'approved' as const,
    createdByUserId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: overrides.deletedAt ?? null,
  }
}

function renderContent(itemId = VALID_ITEM_ID): void {
  renderWithQueryClient(
    <TooltipProvider delayDuration={0}>
      <ItemDetailContent itemId={itemId} />
    </TooltipProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getStoredUser).mockReturnValue(ADMIN_USER)
})

describe('ItemDetailContent', () => {
  it('renders a permission-denied state for a non-admin', () => {
    vi.mocked(getStoredUser).mockReturnValue({ ...ADMIN_USER, role: 'moderator' })
    vi.mocked(useItem).mockReturnValue(mockUseQueryResult({ data: makeItem() }))
    renderContent()
    expect(screen.getByText('Access restricted')).toBeInTheDocument()
  })

  it('renders a translated not-found state for a non-uuid id', () => {
    vi.mocked(useItem).mockReturnValue(mockUseQueryResult({ data: makeItem() }))
    renderContent('not-a-uuid')
    expect(screen.getByText('Item not found')).toBeInTheDocument()
  })

  it('renders a translated not-found state on a 404', () => {
    vi.mocked(useItem).mockReturnValue(mockUseQueryResult({ error: new Error('Not found') }))
    renderContent()
    expect(screen.getByText('Item not found')).toBeInTheDocument()
  })

  it('renders the item header and sources table for a live item', () => {
    vi.mocked(useItem).mockReturnValue(mockUseQueryResult({ data: makeItem() }))
    renderContent()
    expect(screen.getByText('Espresso machine')).toBeInTheDocument()
    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('Sources table rendered (locked=false)')).toBeInTheDocument()
  })

  it('shows the deleted badge and locks the sources table for a soft-deleted item', () => {
    vi.mocked(useItem).mockReturnValue(
      mockUseQueryResult({ data: makeItem({ deletedAt: '2024-06-01T00:00:00.000Z' }) }),
    )
    renderContent()
    expect(screen.getByText('Deleted')).toBeInTheDocument()
    expect(screen.getByText('Sources table rendered (locked=true)')).toBeInTheDocument()
  })

  it('disables the Add source button with a tooltip when the item is soft-deleted', () => {
    vi.mocked(useItem).mockReturnValue(
      mockUseQueryResult({ data: makeItem({ deletedAt: '2024-06-01T00:00:00.000Z' }) }),
    )
    renderContent()
    expect(screen.getByRole('button', { name: /add source/i })).toBeDisabled()
  })
})
