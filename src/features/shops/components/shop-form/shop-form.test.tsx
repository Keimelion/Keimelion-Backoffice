import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { UseFormSetError } from 'react-hook-form'
import { renderWithQueryClient } from '@/test/test-utils'
import { ShopForm } from './shop-form'
import type { ShopFormValues } from './shop-form'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

const MOCK_SHOP = {
  id: 'shop-1',
  slug: 'amazon',
  name: 'Amazon',
  domain: 'amazon.com',
  logoUrl: null,
  isAffiliated: false,
  sortOrder: 0,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ShopForm (create mode)', () => {
  it('renders slug, name, domain, logo, sort order and switches', () => {
    renderWithQueryClient(
      <ShopForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByText('Slug')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Domain')).toBeInTheDocument()
    expect(screen.getByText('Logo URL')).toBeInTheDocument()
    expect(screen.getByText('Sort order')).toBeInTheDocument()
    expect(screen.getByText('Affiliated program')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('keeps the submit button disabled while required fields are missing', () => {
    renderWithQueryClient(
      <ShopForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
  })

  it('enables the submit button once slug and name are set', async () => {
    renderWithQueryClient(
      <ShopForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    await userEvent.type(screen.getByPlaceholderText('amazon'), 'amazon')
    await userEvent.type(screen.getByPlaceholderText('Amazon'), 'Amazon')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create/i })).toBeEnabled()
    })
  })

  it('surfaces a field-level error when setError is called on domain (409 pattern)', async () => {
    const onSubmit = vi.fn(
      (_values: ShopFormValues, setError: UseFormSetError<ShopFormValues>) => {
        setError('domain', { message: 'This domain is already in use.' })
      },
    )
    renderWithQueryClient(
      <ShopForm
        mode="create"
        onSubmit={onSubmit}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    await userEvent.type(screen.getByPlaceholderText('amazon'), 'amazon')
    await userEvent.type(screen.getByPlaceholderText('Amazon'), 'Amazon')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(screen.getByText('This domain is already in use.')).toBeInTheDocument()
    })
  })

  it('reports dirty state via onDirtyChange as the user types', async () => {
    const onDirtyChange = vi.fn()
    renderWithQueryClient(
      <ShopForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={onDirtyChange}
        isPending={false}
      />,
    )
    expect(onDirtyChange).toHaveBeenLastCalledWith(false)
    await userEvent.type(screen.getByPlaceholderText('amazon'), 'a')
    await waitFor(() => {
      expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    })
  })
})

describe('ShopForm (edit mode)', () => {
  it('renders the slug as read-only with the helper text', () => {
    renderWithQueryClient(
      <ShopForm
        mode="edit"
        shop={MOCK_SHOP}
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    const slugInput = screen.getByPlaceholderText('amazon')
    expect(slugInput).toHaveAttribute('readonly')
    expect(slugInput).toBeDisabled()
    expect(screen.getByText('The slug cannot be changed after creation.')).toBeInTheDocument()
  })

  it('prefills existing values', () => {
    renderWithQueryClient(
      <ShopForm
        mode="edit"
        shop={MOCK_SHOP}
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByDisplayValue('Amazon')).toBeInTheDocument()
    expect(screen.getByDisplayValue('amazon.com')).toBeInTheDocument()
  })

  it('shows the save button label', () => {
    renderWithQueryClient(
      <ShopForm
        mode="edit"
        shop={MOCK_SHOP}
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })
})
