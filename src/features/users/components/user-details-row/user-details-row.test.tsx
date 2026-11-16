import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UserStatuses } from '@keimelion/sdk/enums'
import type { UserStatus } from '@keimelion/sdk/enums'
import { renderWithQueryClient } from '@/test/test-utils'
import { buildAdminUser } from '@/features/users/users.test-fixtures'
import { UserDetailsRow } from './user-details-row'

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

const RESEND_LABEL = 'Resend invitation'

function renderDetails(status: UserStatus, canManageUsers: boolean): void {
  renderWithQueryClient(
    <UserDetailsRow user={buildAdminUser({ status })} canManageUsers={canManageUsers} />,
  )
}

describe('UserDetailsRow', () => {
  it('shows the resend invitation action for an invited account when the viewer is admin', () => {
    renderDetails(UserStatuses.INVITED, true)
    expect(screen.getByRole('button', { name: RESEND_LABEL })).toBeInTheDocument()
  })

  it.each([
    UserStatuses.ACTIVE,
    UserStatuses.INACTIVE,
    UserStatuses.UNVERIFIED,
    UserStatuses.BANNED,
    UserStatuses.PENDING_DELETION,
  ])('hides the resend invitation action for a %s account', (status) => {
    renderDetails(status, true)
    expect(screen.queryByRole('button', { name: RESEND_LABEL })).not.toBeInTheDocument()
  })

  it('hides the resend invitation action when the viewer cannot manage users', () => {
    renderDetails(UserStatuses.INVITED, false)
    expect(screen.queryByRole('button', { name: RESEND_LABEL })).not.toBeInTheDocument()
  })

  it('shows the status badge and the activation date', () => {
    renderWithQueryClient(
      <UserDetailsRow
        user={buildAdminUser({
          status: UserStatuses.ACTIVE,
          activatedAt: new Date('2024-03-15T00:00:00.000Z'),
        })}
        canManageUsers
      />,
    )
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('15/03/2024')).toBeInTheDocument()
  })
})
