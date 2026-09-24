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

import type { UseFormSetError } from 'react-hook-form'
import { ItemForm } from './item-form'
import type { ItemFormValues } from './item-form'

const INITIAL_EDIT_VALUES: ItemFormValues = {
  name: 'Espresso machine',
  description: 'A shiny espresso machine.',
  imageUrl: 'https://example.com/image.jpg',
  moderationStatus: 'approved',
}

function renderCreateForm(onSubmit = vi.fn(), onDirtyChange = vi.fn()): void {
  renderWithQueryClient(
    <ItemForm mode="create" onSubmit={onSubmit} onDirtyChange={onDirtyChange} isPending={false} />,
  )
}

function renderEditForm(
  initialValues = INITIAL_EDIT_VALUES,
  onSubmit = vi.fn(),
  onDirtyChange = vi.fn(),
): void {
  renderWithQueryClient(
    <ItemForm
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

describe('ItemForm (create mode)', () => {
  it('renders all create-mode fields', () => {
    renderCreateForm()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Image URL')).toBeInTheDocument()
    expect(screen.getByText('Moderation status')).toBeInTheDocument()
  })

  it('keeps the submit button disabled while the form is empty', () => {
    renderCreateForm()
    expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
  })

  it('defaults moderation status to approved', () => {
    renderCreateForm()
    expect(screen.getByRole('combobox')).toHaveTextContent('Approved')
  })

  it('enables the submit button once the required name field is filled', async () => {
    renderCreateForm()
    await userEvent.type(screen.getByPlaceholderText('Espresso machine'), 'A gift')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create/i })).toBeEnabled()
    })
  })

  it('rejects an http:// image URL with a validation error', async () => {
    renderCreateForm()
    await userEvent.type(screen.getByPlaceholderText('Espresso machine'), 'A gift')
    await userEvent.type(
      screen.getByPlaceholderText('https://example.com/image.jpg'),
      'http://example.com/image.jpg',
    )
    await userEvent.tab()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
    })
  })

  it('calls onSubmit with values when the form is valid', async () => {
    const onSubmit = vi.fn()
    renderCreateForm(onSubmit)
    await userEvent.type(screen.getByPlaceholderText('Espresso machine'), 'A gift')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
    const submittedValues = onSubmit.mock.calls[0]?.[0] as ItemFormValues
    expect(submittedValues.name).toBe('A gift')
    expect(submittedValues.moderationStatus).toBe('approved')
  })

  it('displays root error when setError is called with root', async () => {
    const onSubmit = vi.fn((_values: ItemFormValues, setError: UseFormSetError<ItemFormValues>) => {
      setError('root', { message: 'Unprocessable entity.' })
    })
    renderCreateForm(onSubmit)
    await userEvent.type(screen.getByPlaceholderText('Espresso machine'), 'A gift')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(screen.getByText('Unprocessable entity.')).toBeInTheDocument()
    })
  })

  it('reports dirty state through onDirtyChange as the user types', async () => {
    const onDirtyChange = vi.fn()
    renderCreateForm(vi.fn(), onDirtyChange)
    expect(onDirtyChange).toHaveBeenLastCalledWith(false)
    await userEvent.type(screen.getByPlaceholderText('Espresso machine'), 'A gift')
    await waitFor(() => {
      expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    })
  })
})

describe('ItemForm (edit mode)', () => {
  it('pre-populates fields with initial values', () => {
    renderEditForm()
    expect(screen.getByDisplayValue('Espresso machine')).toBeInTheDocument()
    expect(screen.getByDisplayValue('A shiny espresso machine.')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://example.com/image.jpg')).toBeInTheDocument()
  })

  it('keeps the submit button disabled while nothing has changed', () => {
    renderEditForm()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled()
  })

  it('enables the submit button once a field changes to a valid value', async () => {
    renderEditForm()
    const nameInput = screen.getByDisplayValue('Espresso machine')
    await userEvent.type(nameInput, ' v2')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeEnabled()
    })
  })

  it('blocks submit when the name is cleared to empty', async () => {
    renderEditForm()
    const nameInput = screen.getByDisplayValue('Espresso machine')
    await userEvent.clear(nameInput)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled()
    })
  })
})
