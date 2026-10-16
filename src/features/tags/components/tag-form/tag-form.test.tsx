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
  name: 'gaming',
  slug: 'gaming',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TagForm (create mode)', () => {
  it('renders a single name field and no slug input', () => {
    renderWithQueryClient(
      <TagForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.queryByText('Slug')).not.toBeInTheDocument()
  })

  it('keeps the submit button disabled while the name is empty', () => {
    renderWithQueryClient(
      <TagForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
  })

  it('enables the submit button once a non-empty name is typed', async () => {
    renderWithQueryClient(
      <TagForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    await userEvent.type(screen.getByLabelText(/name/i), 'gaming')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create/i })).toBeEnabled()
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
    await userEvent.type(screen.getByLabelText(/name/i), 'g')
    await waitFor(() => {
      expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    })
  })

  it('surfaces a field-level error on name via setError (409 pattern)', async () => {
    const onSubmit = vi.fn(
      (_values: TagFormValues, setError: UseFormSetError<TagFormValues>) => {
        setError('name', { message: 'This tag already exists.' })
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
    await userEvent.type(screen.getByLabelText(/name/i), 'gaming')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(screen.getByText('This tag already exists.')).toBeInTheDocument()
    })
  })
})

describe('TagForm (edit mode)', () => {
  it('prefills the name and displays the slug read-only', () => {
    renderWithQueryClient(
      <TagForm
        mode="edit"
        tag={MOCK_TAG}
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    const inputsShowingGaming = screen.getAllByDisplayValue('gaming')
    expect(inputsShowingGaming).toHaveLength(2)
    const nameInput = screen.getByLabelText(/^name$/i)
    expect(nameInput).toHaveValue('gaming')
    expect(nameInput).not.toHaveAttribute('readonly')
    const slugInput = screen.getByLabelText(/^slug$/i)
    expect(slugInput).toHaveValue('gaming')
    expect(slugInput).toHaveAttribute('readonly')
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('surfaces a field-level error on name via setError (409 pattern)', async () => {
    const onSubmit = vi.fn(
      (_values: TagFormValues, setError: UseFormSetError<TagFormValues>) => {
        setError('name', { message: 'This tag already exists.' })
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
    const nameInput = screen.getByLabelText(/name/i)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'conflict')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(screen.getByText('This tag already exists.')).toBeInTheDocument()
    })
  })
})
