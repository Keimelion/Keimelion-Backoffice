import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'
import type { UseFormSetError } from 'react-hook-form'
import { UserForm } from './user-form'
import type { UserFormCreateValues, UserFormEditValues } from './user-form'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

const MOCK_USER = {
  id: 'u-1',
  email: 'user@keimelion.app',
  username: 'testuser',
  authProvider: 'email' as const,
  role: 'user' as const,
  avatarUrl: null,
  isCgvAccepted: true,
  cgvAcceptedAt: null,
  isMarketingOptedIn: false,
  emailVerifiedAt: null,
  lastActiveAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  bannedAt: null,
  banReason: null,
  deletedAt: null,
}

const EMAIL_PLACEHOLDER = 'name@example.com'

function renderCreateForm(onSubmit = vi.fn(), onDirtyChange = vi.fn()): void {
  renderWithQueryClient(
    <UserForm
      mode="create"
      onSubmit={onSubmit}
      onDirtyChange={onDirtyChange}
      isPending={false}
    />,
  )
}

function renderEditForm(
  user = MOCK_USER,
  onSubmit = vi.fn(),
  onDirtyChange = vi.fn(),
): void {
  renderWithQueryClient(
    <UserForm
      mode="edit"
      user={user}
      onSubmit={onSubmit}
      onDirtyChange={onDirtyChange}
      isPending={false}
    />,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('UserForm (create mode)', () => {
  it('renders email, username, and role fields', () => {
    renderCreateForm()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
  })

  it('does not render a display name field', () => {
    renderCreateForm()
    expect(screen.queryByText('Display name')).not.toBeInTheDocument()
  })

  it('keeps the submit button disabled while the form is empty (no email)', () => {
    renderCreateForm()
    expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
  })

  it('enables the submit button once required fields are filled', async () => {
    renderCreateForm()
    await userEvent.type(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), 'new@keimelion.app')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create/i })).toBeEnabled()
    })
  })

  it('keeps the submit button disabled for invalid email after touch', async () => {
    renderCreateForm()
    const emailInput = screen.getByPlaceholderText(EMAIL_PLACEHOLDER)
    await userEvent.type(emailInput, 'not-an-email')
    await userEvent.tab()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
    })
  })

  it('calls onSubmit with values when form is valid', async () => {
    const onSubmit = vi.fn()
    renderCreateForm(onSubmit)
    await userEvent.type(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), 'new@keimelion.app')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  it('displays root error when setError is called with root', async () => {
    const onSubmit = vi.fn((
      _values: UserFormCreateValues,
      setError: UseFormSetError<UserFormCreateValues>,
    ) => {
      setError('root', { message: 'Server error.' })
    })
    renderCreateForm(onSubmit)
    await userEvent.type(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), 'new@keimelion.app')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(screen.getByText('Server error.')).toBeInTheDocument()
    })
  })

  it('reports dirty state through onDirtyChange as the user types', async () => {
    const onDirtyChange = vi.fn()
    renderCreateForm(vi.fn(), onDirtyChange)
    expect(onDirtyChange).toHaveBeenLastCalledWith(false)
    await userEvent.type(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), 'x')
    await waitFor(() => {
      expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    })
  })
})

describe('UserForm (edit mode)', () => {
  it('renders only the role field', () => {
    renderEditForm()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.queryByText('Email')).not.toBeInTheDocument()
    expect(screen.queryByText('Username')).not.toBeInTheDocument()
  })

  it('keeps the submit button disabled when role is unchanged', () => {
    renderEditForm()
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('does not show the role change warning when form is not dirty', () => {
    renderEditForm()
    expect(screen.queryByText(/changing this user.*sign them out/i)).not.toBeInTheDocument()
  })

  it('shows root error via setError', async () => {
    const onSubmit = vi.fn((
      _values: UserFormEditValues,
      setError: UseFormSetError<UserFormEditValues>,
    ) => {
      setError('root', { message: 'Update failed.' })
    })
    renderEditForm(MOCK_USER, onSubmit)
    const combobox = screen.getByRole('combobox')
    await userEvent.click(combobox)
    const adminOption = await screen.findByRole('option', { name: /admin/i })
    await userEvent.click(adminOption)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeEnabled()
    })
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByText('Update failed.')).toBeInTheDocument()
    })
  })
})
