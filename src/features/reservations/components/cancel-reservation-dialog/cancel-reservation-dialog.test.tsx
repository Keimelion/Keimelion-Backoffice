import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { ApiAdminReservation } from '@/data-access/reservations/reservations.schemas'
import { renderWithQueryClient } from '@/test/test-utils'
import { CancelReservationDialog } from './cancel-reservation-dialog'

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

const mutateMock = vi.fn()

vi.mock('@/features/reservations/hooks/use-delete-admin-reservation', () => ({
  useDeleteAdminReservation: () => ({
    mutate: mutateMock,
    isPending: false,
  }),
}))

const USER_ID = '22222222-2222-4222-8222-222222222222'
const RESERVATION_ID = '11111111-1111-4111-8111-111111111111'

const RESERVATION: ApiAdminReservation = {
  id: RESERVATION_ID,
  quantityBooked: 2,
  createdAt: '2024-02-01T00:00:00.000Z',
  listItem: {
    id: 'li-1',
    itemId: '33333333-3333-4333-8333-333333333333',
    name: 'Weighted blanket',
    quantityDesired: 3,
    image: null,
  },
  list: {
    id: 'list-1',
    slug: 'wedding',
    title: 'Wedding wishlist',
    owner: null,
  },
  user: {
    id: USER_ID,
    email: 'reserver@example.com',
    username: 'reserver',
    authProvider: 'email',
    role: 'user',
    avatarUrl: null,
    isCgvAccepted: true,
    cgvAcceptedAt: '2024-01-01T00:00:00.000Z',
    isMarketingOptedIn: false,
    defaultCurrency: 'EUR',
    emailVerifiedAt: '2024-01-01T00:00:00.000Z',
    lastActiveAt: '2024-02-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CancelReservationDialog', () => {
  it('renders the reserver and item name in the description', () => {
    renderWithQueryClient(
      <CancelReservationDialog
        open
        onOpenChange={vi.fn()}
        reservation={RESERVATION}
      />,
    )
    expect(screen.getByText('Cancel reservation?')).toBeInTheDocument()
    expect(screen.getByText(/by reserver on "Weighted blanket"/)).toBeInTheDocument()
  })

  it('calls the delete mutation on confirm', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(
      <CancelReservationDialog
        open
        onOpenChange={vi.fn()}
        reservation={RESERVATION}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Yes, cancel reservation' }))
    expect(mutateMock).toHaveBeenCalledWith(RESERVATION_ID, expect.any(Object))
  })
})
