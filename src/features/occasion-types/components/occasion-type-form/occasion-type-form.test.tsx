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
import { OccasionTypeForm } from './occasion-type-form'
import type { OccasionTypeFormValues } from './occasion-type-form'
import { LOCALES, DEFAULT_LOCALE, LOCALE_NATIVE_NAMES } from '@/lib/i18n/locale'

const INITIAL_EDIT_VALUES: OccasionTypeFormValues = {
  slug: 'birthday',
  emoji: '🎂',
  sortOrder: 0,
  isActive: true,
  translations: {
    en: 'Birthday',
    fr: 'Anniversaire',
  },
}

function renderCreateForm(onSubmit = vi.fn(), onDirtyChange = vi.fn()): void {
  renderWithQueryClient(
    <OccasionTypeForm
      mode="create"
      onSubmit={onSubmit}
      onDirtyChange={onDirtyChange}
      isPending={false}
    />,
  )
}

function renderEditForm(
  initialValues = INITIAL_EDIT_VALUES,
  onSubmit = vi.fn(),
  onDirtyChange = vi.fn(),
): void {
  renderWithQueryClient(
    <OccasionTypeForm
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

describe('OccasionTypeForm (create mode)', () => {
  it('renders one label field per locale in LOCALES order', () => {
    renderCreateForm()
    LOCALES.forEach((locale) => {
      expect(
        screen.getByRole('textbox', { name: `Label (${LOCALE_NATIVE_NAMES[locale]})` }),
      ).toBeInTheDocument()
    })
  })

  it('renders all create-mode fields', () => {
    renderCreateForm()
    expect(screen.getByText('Slug')).toBeInTheDocument()
    expect(screen.getByText('Emoji')).toBeInTheDocument()
    expect(screen.getByText('Sort order')).toBeInTheDocument()
    LOCALES.forEach((locale) => {
      expect(screen.getByText(`Label (${LOCALE_NATIVE_NAMES[locale]})`)).toBeInTheDocument()
    })
  })

  it('does not render a cancel button (closure happens via Dialog primitive)', () => {
    renderCreateForm()
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
  })

  it('keeps the submit button disabled while the form is empty', () => {
    renderCreateForm()
    expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
  })

  it('enables the submit button once required fields pass validation', async () => {
    renderCreateForm()
    await userEvent.type(screen.getByPlaceholderText('my-occasion'), 'birthday')
    await userEvent.type(
      screen.getByRole('textbox', { name: `Label (${LOCALE_NATIVE_NAMES[DEFAULT_LOCALE]})` }),
      'Birthday',
    )
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create/i })).toBeEnabled()
    })
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

  it('shows required error for empty default locale label after touching then leaving it empty', async () => {
    renderCreateForm()
    const defaultLocaleInput = screen.getByRole('textbox', {
      name: `Label (${LOCALE_NATIVE_NAMES[DEFAULT_LOCALE]})`,
    })
    await userEvent.click(defaultLocaleInput)
    await userEvent.tab()
    await waitFor(() => {
      expect(screen.getByText('The English label is required.')).toBeInTheDocument()
    })
  })

  it('does not show a validation error when a non-default locale label is left empty', async () => {
    renderCreateForm()
    const nonDefaultLocale = LOCALES.find((locale) => locale !== DEFAULT_LOCALE)
    if (!nonDefaultLocale) throw new Error('No non-default locale found')
    const nonDefaultInput = screen.getByRole('textbox', {
      name: `Label (${LOCALE_NATIVE_NAMES[nonDefaultLocale]})`,
    })
    await userEvent.click(nonDefaultInput)
    await userEvent.tab()
    await waitFor(() => {
      expect(screen.queryByText('The English label is required.')).not.toBeInTheDocument()
    })
  })

  it('calls onSubmit with values when form is valid', async () => {
    const onSubmit = vi.fn()
    renderCreateForm(onSubmit)
    await userEvent.type(screen.getByPlaceholderText('my-occasion'), 'birthday')
    await userEvent.type(
      screen.getByRole('textbox', { name: `Label (${LOCALE_NATIVE_NAMES[DEFAULT_LOCALE]})` }),
      'Birthday',
    )
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  it('displays root error when setError is called with root', async () => {
    const onSubmit = vi.fn((
      _values: OccasionTypeFormValues,
      setError: UseFormSetError<OccasionTypeFormValues>,
    ) => {
      setError('root', { message: 'Unprocessable entity.' })
    })
    renderCreateForm(onSubmit)
    await userEvent.type(screen.getByPlaceholderText('my-occasion'), 'birthday')
    await userEvent.type(
      screen.getByRole('textbox', { name: `Label (${LOCALE_NATIVE_NAMES[DEFAULT_LOCALE]})` }),
      'Birthday',
    )
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(screen.getByText('Unprocessable entity.')).toBeInTheDocument()
    })
  })

  it('displays slug error when setError is called with slug (409)', async () => {
    const onSubmit = vi.fn((
      _values: OccasionTypeFormValues,
      setError: UseFormSetError<OccasionTypeFormValues>,
    ) => {
      setError('slug', { message: 'This slug is already in use.' })
    })
    renderCreateForm(onSubmit)
    await userEvent.type(screen.getByPlaceholderText('my-occasion'), 'birthday')
    await userEvent.type(
      screen.getByRole('textbox', { name: `Label (${LOCALE_NATIVE_NAMES[DEFAULT_LOCALE]})` }),
      'Birthday',
    )
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(screen.getByText('This slug is already in use.')).toBeInTheDocument()
    })
  })

  it('reports dirty state through onDirtyChange as the user types', async () => {
    const onDirtyChange = vi.fn()
    renderCreateForm(vi.fn(), onDirtyChange)
    expect(onDirtyChange).toHaveBeenLastCalledWith(false)
    await userEvent.type(screen.getByPlaceholderText('my-occasion'), 'birthday')
    await waitFor(() => {
      expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    })
  })

})

describe('OccasionTypeForm (edit mode)', () => {
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

  it('keeps the submit button disabled while nothing has changed', () => {
    renderEditForm()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled()
  })

  it('enables the submit button once a field changes to a valid value', async () => {
    renderEditForm()
    const emojiInput = screen.getByDisplayValue('🎂')
    await userEvent.clear(emojiInput)
    await userEvent.type(emojiInput, '🎉')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeEnabled()
    })
  })

  it('shows root error for 422 on submit via setError', async () => {
    const onSubmit = vi.fn((
      _values: OccasionTypeFormValues,
      setError: UseFormSetError<OccasionTypeFormValues>,
    ) => {
      setError('root', { message: 'Validation failed.' })
    })
    renderEditForm(INITIAL_EDIT_VALUES, onSubmit)
    const emojiInput = screen.getByDisplayValue('🎂')
    await userEvent.clear(emojiInput)
    await userEvent.type(emojiInput, '🎉')
    const form = screen.getByRole('button', { name: /save changes/i }).closest('form')
    if (form) fireEvent.submit(form)
    await waitFor(() => {
      expect(screen.getByText('Validation failed.')).toBeInTheDocument()
    })
  })

  it('shows default locale required error when label is cleared', async () => {
    renderEditForm()
    const defaultLocaleInput = screen.getByDisplayValue('Birthday')
    await userEvent.clear(defaultLocaleInput)
    await userEvent.tab()
    await waitFor(() => {
      expect(screen.getByText('The English label is required.')).toBeInTheDocument()
    })
  })

  it('calls onSubmit with null for cleared non-default locale translation', async () => {
    const onSubmit = vi.fn()
    const nonDefaultLocale = LOCALES.find((locale) => locale !== DEFAULT_LOCALE)
    if (!nonDefaultLocale) throw new Error('No non-default locale found')

    renderEditForm(INITIAL_EDIT_VALUES, onSubmit)
    const nonDefaultInput = screen.getByDisplayValue('Anniversaire')
    await userEvent.clear(nonDefaultInput)
    const emojiInput = screen.getByDisplayValue('🎂')
    await userEvent.clear(emojiInput)
    await userEvent.type(emojiInput, '🎉')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
      const submittedValues = onSubmit.mock.calls[0]?.[0] as OccasionTypeFormValues
      expect(submittedValues.translations[nonDefaultLocale]).toBeNull()
    })
  })
})
