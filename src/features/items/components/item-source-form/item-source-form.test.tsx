import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

vi.mock('@/features/shops/hooks/use-shops', () => ({
  useShops: () => ({ data: [{ id: 'shop-1', name: 'Amazon' }], isLoading: false, isError: false }),
}))

import type { UseFormSetError } from 'react-hook-form'
import { ItemSourceForm } from './item-source-form'
import type { ItemSourceFormValues } from './item-source-form'

const INITIAL_EDIT_VALUES: ItemSourceFormValues = {
  shopId: null,
  sourceUrl: 'https://shop.example.com/product',
  price: '19.99',
  currency: 'EUR',
  isPrimary: false,
}

function renderCreateForm(onSubmit = vi.fn(), onDirtyChange = vi.fn()): void {
  renderWithQueryClient(
    <ItemSourceForm mode="create" onSubmit={onSubmit} onDirtyChange={onDirtyChange} isPending={false} />,
  )
}

function renderEditForm(
  initialValues = INITIAL_EDIT_VALUES,
  onSubmit = vi.fn(),
  onDirtyChange = vi.fn(),
): void {
  renderWithQueryClient(
    <ItemSourceForm
      mode="edit"
      initialValues={initialValues}
      onSubmit={onSubmit}
      onDirtyChange={onDirtyChange}
      isPending={false}
    />,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ItemSourceForm (create mode)', () => {
  it('renders all fields with the EUR default currency', () => {
    renderCreateForm()
    expect(screen.getByText('Source URL')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByDisplayValue('EUR')).toBeInTheDocument()
    expect(screen.getByText('Shop')).toBeInTheDocument()
    expect(screen.getByText('Primary source')).toBeInTheDocument()
  })

  it('lists shops from useShops in the shop picker', async () => {
    renderCreateForm()
    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getAllByText('Amazon').length).toBeGreaterThan(0)
    expect(screen.getAllByText('No shop').length).toBeGreaterThan(0)
  })

  it('keeps the submit button disabled while the form is unchanged (all-optional fields)', () => {
    renderCreateForm()
    expect(screen.getByRole('button', { name: /add source/i })).toBeDisabled()
  })

  it('rejects an http:// source URL', async () => {
    renderCreateForm()
    await userEvent.type(
      screen.getByPlaceholderText('https://shop.example.com/product'),
      'http://shop.example.com/product',
    )
    await userEvent.tab()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add source/i })).toBeDisabled()
    })
  })

  it('rejects an invalid price shape', async () => {
    renderCreateForm()
    await userEvent.type(screen.getByPlaceholderText('19.99'), '1.234')
    await userEvent.tab()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add source/i })).toBeDisabled()
    })
  })

  it('calls onSubmit with values when the form is valid', async () => {
    const onSubmit = vi.fn()
    renderCreateForm(onSubmit)
    await userEvent.type(
      screen.getByPlaceholderText('https://shop.example.com/product'),
      'https://shop.example.com/product',
    )
    await userEvent.click(screen.getByRole('button', { name: /add source/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
    const submittedValues = onSubmit.mock.calls[0]?.[0] as ItemSourceFormValues
    expect(submittedValues.sourceUrl).toBe('https://shop.example.com/product')
    expect(submittedValues.currency).toBe('EUR')
  })

  it('displays root error when setError is called with root', async () => {
    const onSubmit = vi.fn((_values: ItemSourceFormValues, setError: UseFormSetError<ItemSourceFormValues>) => {
      setError('root', { message: 'Unprocessable entity.' })
    })
    renderCreateForm(onSubmit)
    await userEvent.type(
      screen.getByPlaceholderText('https://shop.example.com/product'),
      'https://shop.example.com/product',
    )
    await userEvent.click(screen.getByRole('button', { name: /add source/i }))
    await waitFor(() => {
      expect(screen.getByText('Unprocessable entity.')).toBeInTheDocument()
    })
  })
})

describe('ItemSourceForm (edit mode)', () => {
  it('pre-populates fields with initial values', () => {
    renderEditForm()
    expect(screen.getByDisplayValue('https://shop.example.com/product')).toBeInTheDocument()
    expect(screen.getByDisplayValue('19.99')).toBeInTheDocument()
  })

  it('keeps the submit button disabled while nothing has changed', () => {
    renderEditForm()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled()
  })

  it('enables the submit button once isPrimary is toggled', async () => {
    renderEditForm()
    await userEvent.click(screen.getByRole('switch'))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeEnabled()
    })
  })
})
