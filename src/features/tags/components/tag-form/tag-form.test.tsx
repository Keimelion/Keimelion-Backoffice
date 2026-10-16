import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { UseFormSetError } from 'react-hook-form'
import { renderWithQueryClient } from '@/test/test-utils'
import { TagForm } from './tag-form'
import type { TagFormValues } from './tag-form'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

const MOCK_TAG = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Gaming',
  slug: 'gaming',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TagForm (create mode)', () => {
  it('renders both name and slug fields', () => {
    renderWithQueryClient(
      <TagForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^slug$/i)).toBeInTheDocument()
  })

  it('keeps the submit button disabled while either field is empty', async () => {
    renderWithQueryClient(
      <TagForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
    await userEvent.type(screen.getByLabelText(/^name$/i), 'Gaming')
    expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
  })

  it('enables the submit button once both name and slug are valid', async () => {
    renderWithQueryClient(
      <TagForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    await userEvent.type(screen.getByLabelText(/^name$/i), 'Gaming')
    await userEvent.type(screen.getByLabelText(/^slug$/i), 'gaming')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create/i })).toBeEnabled()
    })
  })

  it('rejects a slug that is not kebab-case', async () => {
    renderWithQueryClient(
      <TagForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    await userEvent.type(screen.getByLabelText(/^name$/i), 'Gaming')
    const slugInput = screen.getByLabelText(/^slug$/i)
    await userEvent.type(slugInput, 'Not A Slug!')
    await userEvent.tab()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
    })
  })

  it('reports dirty state via onDirtyChange as the user types', async () => {
    const onDirtyChange = vi.fn()
    renderWithQueryClient(
      <TagForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={onDirtyChange}
        isPending={false}
      />,
    )
    expect(onDirtyChange).toHaveBeenLastCalledWith(false)
    await userEvent.type(screen.getByLabelText(/^name$/i), 'g')
    await waitFor(() => {
      expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    })
  })

  it('surfaces a field-level error on slug via setError (409 pattern)', async () => {
    const onSubmit = vi.fn(
      (_values: TagFormValues, setError: UseFormSetError<TagFormValues>) => {
        setError('slug', { message: 'This slug is already taken.' })
      },
    )
    renderWithQueryClient(
      <TagForm
        mode="create"
        onSubmit={onSubmit}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    await userEvent.type(screen.getByLabelText(/^name$/i), 'Gaming')
    await userEvent.type(screen.getByLabelText(/^slug$/i), 'gaming')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(screen.getByText('This slug is already taken.')).toBeInTheDocument()
    })
  })
})

describe('TagForm (edit mode)', () => {
  it('prefills both name and slug, both editable', () => {
    renderWithQueryClient(
      <TagForm
        mode="edit"
        tag={MOCK_TAG}
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    const nameInput = screen.getByLabelText(/^name$/i)
    expect(nameInput).toHaveValue('Gaming')
    expect(nameInput).not.toHaveAttribute('readonly')
    const slugInput = screen.getByLabelText(/^slug$/i)
    expect(slugInput).toHaveValue('gaming')
    expect(slugInput).not.toHaveAttribute('readonly')
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('surfaces a field-level error on slug via setError (409 pattern)', async () => {
    const onSubmit = vi.fn(
      (_values: TagFormValues, setError: UseFormSetError<TagFormValues>) => {
        setError('slug', { message: 'This slug is already taken.' })
      },
    )
    renderWithQueryClient(
      <TagForm
        mode="edit"
        tag={MOCK_TAG}
        onSubmit={onSubmit}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    const slugInput = screen.getByLabelText(/^slug$/i)
    await userEvent.clear(slugInput)
    await userEvent.type(slugInput, 'conflict')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(screen.getByText('This slug is already taken.')).toBeInTheDocument()
    })
  })
})
