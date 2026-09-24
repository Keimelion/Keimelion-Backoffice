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
    softDeleteItem: vi.fn(),
  }
})

import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { softDeleteItem } from '@/data-access/items/items.api'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { DeleteItemDialog } from './delete-item-dialog'

const onOpenChange = vi.fn()

function renderDialog(open = true): void {
  renderWithQueryClient(
    <DeleteItemDialog open={open} onOpenChange={onOpenChange} itemId="item-1" itemName="Espresso machine" />,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DeleteItemDialog', () => {
  it('renders the dialog with title and contextual buttons', () => {
    renderDialog()
    expect(screen.getByText('Delete item')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Yes, delete item' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'No, keep item' })).toBeInTheDocument()
  })

  it('calls softDeleteItem and shows a success toast on 200', async () => {
    vi.mocked(softDeleteItem).mockResolvedValue(undefined)
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: 'Yes, delete item' }))
    await waitFor(() => {
      expect(softDeleteItem).toHaveBeenCalledWith('item-1', expect.anything())
    })
    await waitFor(() => {
      expect(toastMock.success).toHaveBeenCalledWith('Item deleted.', expect.anything())
    })
  })

  it('surfaces the API metadata.message verbatim on a 409 conflict', async () => {
    const conflictError = new ApiRequestError('CONFLICT', 'Conflict', HttpStatus.CONFLICT, {
      message: 'Item referenced by 3 list_items',
    })
    vi.mocked(softDeleteItem).mockRejectedValue(conflictError)
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: 'Yes, delete item' }))
    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith('Item referenced by 3 list_items', expect.anything())
    })
    expect(toastMock.success).not.toHaveBeenCalled()
  })

  it('does not call softDeleteItem when the cancel button is clicked', async () => {
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: 'No, keep item' }))
    expect(softDeleteItem).not.toHaveBeenCalled()
  })
})
