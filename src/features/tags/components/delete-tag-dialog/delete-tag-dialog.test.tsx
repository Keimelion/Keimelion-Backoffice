import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'
import { DeleteTagDialog } from './delete-tag-dialog'

const deleteTagMock = vi.fn((_id: string): Promise<void> => Promise.resolve())

vi.mock('@/data-access/tags/tags.api', () => ({
  TAGS_QUERY_KEY: ['tags'] as const,
  deleteTag: (id: string) => deleteTagMock(id),
  listAdminTags: vi.fn(),
  fetchAdminTag: vi.fn(),
  createTag: vi.fn(),
  updateTag: vi.fn(),
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
  deleteTagMock.mockClear()
})

describe('DeleteTagDialog', () => {
  it('calls deleteTag when the confirm button is clicked', async () => {
    const onOpenChange = vi.fn()
    renderWithQueryClient(
      <DeleteTagDialog open onOpenChange={onOpenChange} tag={MOCK_TAG} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /yes, delete tag/i }))
    await waitFor(() => {
      expect(deleteTagMock).toHaveBeenCalledWith(MOCK_TAG.id)
    })
  })

  it('does not call deleteTag when the cancel button is clicked', async () => {
    const onOpenChange = vi.fn()
    renderWithQueryClient(
      <DeleteTagDialog open onOpenChange={onOpenChange} tag={MOCK_TAG} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /no, keep tag/i }))
    expect(deleteTagMock).not.toHaveBeenCalled()
  })
})
