import { fireEvent, screen, waitFor } from '@testing-library/react'
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
import type { CreateOccasionTypeInput, UpdateOccasionTypeInput } from '@/data-access/occasion-types/admin-occasion-types.schemas'
import { OccasionTypeCreateForm, OccasionTypeEditForm } from './occasion-type-form'
import type { EditFormValues } from './occasion-type-form'

const INITIAL_EDIT_VALUES: EditFormValues = {
  slug: 'birthday',
  emoji: '🎂',
  sortOrder: 0,
  isActive: true,
  labelEn: 'Birthday',
  labelFr: 'Anniversaire',
}

function renderCreateForm(onSubmit = vi.fn(), onCancel = vi.fn()): void {
  renderWithQueryClient(
    <OccasionTypeCreateForm
      mode="create"
      onSubmit={onSubmit}
      onCancel={onCancel}
      isPending={false}
    />,
  )
}

function renderEditForm(
  initialValues = INITIAL_EDIT_VALUES,
  onSubmit = vi.fn(),
  onCancel = vi.fn(),
): void {
  renderWithQueryClient(
    <OccasionTypeEditForm
      mode="edit"
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isPending={false}
    />,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('OccasionTypeCreateForm', () => {
  it('renders all create-mode fields', () => {
    renderCreateForm()
    expect(screen.getByText('Slug')).toBeInTheDocument()
    expect(screen.getByText('Emoji')).toBeInTheDocument()
    expect(screen.getByText('Sort order')).toBeInTheDocument()
    expect(screen.getByText('Label (English)')).toBeInTheDocument()
    expect(screen.getByText('Label (French)')).toBeInTheDocument()
  })

  it('shows slug validation error for invalid slug', async () => {
    renderCreateForm()
    const slugInput = screen.getByPlaceholderText('my-occasion')
    await userEvent.type(slugInput, 'INVALID SLUG!!')
    await userEvent.tab()
    await waitFor(() => {
      expect(
        screen.getByText('Slug must be lowercase letters and digits separated by hyphens (e.g. my-occasion).'),
      ).toBeInTheDocument()
    })
  })

  it('shows required error for empty english label', async () => {
    renderCreateForm()
    const slugInput = screen.getByPlaceholderText('my-occasion')
    await userEvent.type(slugInput, 'my-slug')
    const form = screen.getByRole('button', { name: /create/i }).closest('form')
    if (form) fireEvent.submit(form)
    await waitFor(() => {
      expect(screen.getByText('The English label is required.')).toBeInTheDocument()
    })
  })

  it('calls onSubmit with values when form is valid', async () => {
    const onSubmit = vi.fn()
    renderCreateForm(onSubmit)
    await userEvent.type(screen.getByPlaceholderText('my-occasion'), 'birthday')
    await userEvent.type(screen.getByRole('textbox', { name: 'Label (English)' }), 'Birthday')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  it('displays root error when setError is called with root', async () => {
    const onSubmit = vi.fn((
      _values: CreateOccasionTypeInput,
      setError: UseFormSetError<CreateOccasionTypeInput>,
    ) => {
      setError('root', { message: 'Unprocessable entity.' })
    })
    renderCreateForm(onSubmit)
    await userEvent.type(screen.getByPlaceholderText('my-occasion'), 'birthday')
    await userEvent.type(screen.getByRole('textbox', { name: 'Label (English)' }), 'Birthday')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(screen.getByText('Unprocessable entity.')).toBeInTheDocument()
    })
  })

  it('displays slug error when setError is called with slug (409)', async () => {
    const onSubmit = vi.fn((
      _values: CreateOccasionTypeInput,
      setError: UseFormSetError<CreateOccasionTypeInput>,
    ) => {
      setError('slug', { message: 'This slug is already in use.' })
    })
    renderCreateForm(onSubmit)
    await userEvent.type(screen.getByPlaceholderText('my-occasion'), 'birthday')
    await userEvent.type(screen.getByRole('textbox', { name: 'Label (English)' }), 'Birthday')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(screen.getByText('This slug is already in use.')).toBeInTheDocument()
    })
  })

  it('does not call onCancel directly when form is dirty (guard fires)', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    renderCreateForm(vi.fn(), onCancel)
    const slugInput = screen.getByPlaceholderText('my-occasion')
    await user.type(slugInput, 'birthday')
    await waitFor(() => {
      expect((slugInput as HTMLInputElement).value).toBe('birthday')
    })
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('calls onCancel directly when form is not dirty', async () => {
    const onCancel = vi.fn()
    renderCreateForm(vi.fn(), onCancel)
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})

describe('OccasionTypeEditForm', () => {
  it('pre-populates fields with initial values', () => {
    renderEditForm()
    expect(screen.getByDisplayValue('Birthday')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Anniversaire')).toBeInTheDocument()
  })

  it('shows slug as disabled with a description', () => {
    renderEditForm()
    const slugInput = screen.getByDisplayValue('birthday')
    expect(slugInput).toBeDisabled()
    expect(screen.getByText(/slug cannot be changed/i)).toBeInTheDocument()
  })

  it('shows root error for 422 on submit via setError', async () => {
    const onSubmit = vi.fn((
      _values: UpdateOccasionTypeInput,
      setError: UseFormSetError<UpdateOccasionTypeInput>,
    ) => {
      setError('root', { message: 'Validation failed.' })
    })
    renderEditForm(INITIAL_EDIT_VALUES, onSubmit)
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(screen.getByText('Validation failed.')).toBeInTheDocument()
    })
  })

  it('shows en required error when label is cleared', async () => {
    renderEditForm()
    const enInput = screen.getByDisplayValue('Birthday')
    await userEvent.clear(enInput)
    const form = screen.getByRole('button', { name: /save changes/i }).closest('form')
    if (form) fireEvent.submit(form)
    await waitFor(() => {
      expect(screen.getByText('The English label is required.')).toBeInTheDocument()
    })
  })
})
