import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'
import { DeleteShopDialog } from './delete-shop-dialog'

const deleteShopMock = vi.fn((_id: string): Promise<void> => Promise.resolve())

vi.mock('@/data-access/shops/admin-shops.api', () => ({
  SHOPS_QUERY_KEY: ['shops'] as const,
  deleteShop: (id: string) => deleteShopMock(id),
  listAdminShops: vi.fn(),
  createShop: vi.fn(),
  updateShop: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

const MOCK_SHOP = {
  id: 'shop-1',
  slug: 'amazon',
  name: 'Amazon',
  domain: null,
  logoUrl: null,
  isAffiliated: false,
  sortOrder: 0,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

beforeEach(() => {
  deleteShopMock.mockClear()
})

describe('DeleteShopDialog', () => {
  it('calls deleteShop when the confirm button is clicked', async () => {
    const onOpenChange = vi.fn()
    renderWithQueryClient(
      <DeleteShopDialog open onOpenChange={onOpenChange} shop={MOCK_SHOP} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /yes, delete shop/i }))
    await waitFor(() => {
      expect(deleteShopMock).toHaveBeenCalledWith('shop-1')
    })
  })

  it('does not call deleteShop when the cancel button is clicked', async () => {
    const onOpenChange = vi.fn()
    renderWithQueryClient(
      <DeleteShopDialog open onOpenChange={onOpenChange} shop={MOCK_SHOP} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /no, keep shop/i }))
    expect(deleteShopMock).not.toHaveBeenCalled()
  })
})
