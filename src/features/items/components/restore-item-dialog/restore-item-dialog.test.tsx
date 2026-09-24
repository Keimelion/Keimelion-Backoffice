import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

const { toastMock } = vi.hoisted(() => ({
  toastMock: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))
vi.mock('sonner', () => ({ toast: toastMock }))

vi.mock(import('@/data-access/items/items.api'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    restoreItem: vi.fn(),
  }
})

import { restoreItem } from '@/data-access/items/items.api'
import { RestoreItemDialog } from './restore-item-dialog'

const onOpenChange = vi.fn()

function renderDialog(open = true): void {
  renderWithQueryClient(
    <RestoreItemDialog open={open} onOpenChange={onOpenChange} itemId="item-1" itemName="Espresso machine" />,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RestoreItemDialog', () => {
  it('renders the dialog with title and contextual buttons', () => {
    renderDialog()
    expect(screen.getByText('Restore item')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Yes, restore item' })).toBeInTheDocument()
  })

  it('calls restoreItem and shows a success toast on 200', async () => {
    vi.mocked(restoreItem).mockResolvedValue({
      id: 'item-1',
      name: 'Espresso machine',
      description: null,
      imageUrl: null,
      moderationStatus: 'approved',
      createdByUserId: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      deletedAt: null,
    })
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: 'Yes, restore item' }))
    await waitFor(() => {
      expect(restoreItem).toHaveBeenCalledWith('item-1', expect.anything())
    })
    await waitFor(() => {
      expect(toastMock.success).toHaveBeenCalledWith('Item restored.', expect.anything())
    })
  })

  it('does not show a success toast when the API returns a 404 (already live)', async () => {
    vi.mocked(restoreItem).mockRejectedValue(new Error('Not found'))
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: 'Yes, restore item' }))
    await waitFor(() => {
      expect(restoreItem).toHaveBeenCalled()
    })
    expect(toastMock.success).not.toHaveBeenCalled()
  })
})
