import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorCode, HttpStatus } from '@keimelion/sdk/enums'
import { apiErrorBody, createApiMock, type ApiMock } from '@/test/api-mock'
import { renderWithQueryClient } from '@/test/test-utils'
import { USER_ID, buildAdminUser } from '@/features/users/users.test-fixtures'
import { EditUserDialog } from './edit-user-dialog'

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

const INVALID_OPERATION_MESSAGE = 'An invited staff account cannot be downgraded to user.'

let mock: ApiMock

beforeEach(() => {
  mock = createApiMock()
})

afterEach(() => {
  mock.restore()
})

describe('EditUserDialog', () => {
  it('shows the API message when an invited staff account is changed to user', async () => {
    mock.onPatch(`/admin/users/${USER_ID}`).reply(
      HttpStatus.BAD_REQUEST,
      apiErrorBody(ErrorCode.INVALID_OPERATION, INVALID_OPERATION_MESSAGE),
    )
    renderWithQueryClient(
      <EditUserDialog open onOpenChange={vi.fn()} user={buildAdminUser()} />,
    )

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByRole('option', { name: 'User' }))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText(INVALID_OPERATION_MESSAGE)).toBeInTheDocument()
    })
  })
})
