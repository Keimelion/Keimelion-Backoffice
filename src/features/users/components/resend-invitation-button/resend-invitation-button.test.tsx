import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorCode, HttpStatus } from '@keimelion/sdk/enums'
import { apiErrorBody, createApiMock, type ApiMock } from '@/test/api-mock'
import { TooltipProvider } from '@/components/ui/tooltip'
import { renderWithQueryClient } from '@/test/test-utils'
import { USER_ID, buildAdminUser } from '@/features/users/users.test-fixtures'
import { ResendInvitationButton } from './resend-invitation-button'

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

const RESEND_PATH = `/admin/users/${USER_ID}/resend-invitation`
const USER = buildAdminUser()

let mock: ApiMock

beforeEach(() => {
  vi.clearAllMocks()
  mock = createApiMock()
})

afterEach(() => {
  mock.restore()
})

async function clickResend(): Promise<void> {
  renderWithQueryClient(
    <TooltipProvider delayDuration={0}>
      <ResendInvitationButton user={USER} />
    </TooltipProvider>,
  )
  await userEvent.click(screen.getByRole('button', { name: `Resend invitation to ${USER.email}` }))
}

describe('ResendInvitationButton', () => {
  it('shows a confirmation toast when the invitation is resent', async () => {
    mock.onPost(RESEND_PATH).reply(HttpStatus.OK, {
      user: { ...USER, createdAt: USER.createdAt.toISOString(), updatedAt: USER.updatedAt.toISOString() },
    })

    await clickResend()

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        `Invitation email resent to ${USER.email}.`,
        expect.anything(),
      )
    })
  })

  it.each([
    [HttpStatus.CONFLICT, ErrorCode.STAFF_INVITATION_NOT_PENDING, 'This account has already been activated.'],
    [HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.STAFF_INVITATION_NOT_STAFF_ACCOUNT, 'Only staff accounts can be invited.'],
  ])('shows the API message for a %i %s error', async (status, code, message) => {
    mock.onPost(RESEND_PATH).reply(status, apiErrorBody(code, message))

    await clickResend()

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(message, expect.anything())
    })
  })

  it('falls back to the generic error toast for other failures', async () => {
    mock.onPost(RESEND_PATH).reply(
      HttpStatus.INTERNAL_SERVER_ERROR,
      apiErrorBody(ErrorCode.INTERNAL_ERROR, 'Boom'),
    )

    await clickResend()

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Something went wrong', { description: 'Boom' })
    })
  })
})
