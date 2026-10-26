import type { ReactElement } from 'react'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { ApiAdminReservation } from '@/data-access/reservations/reservations.schemas'
import { TooltipProvider } from '@/components/ui/tooltip'
import { renderWithQueryClient } from '@/test/test-utils'
import { ReservationsList } from './reservations-list'

const useSearchParamsMock = vi.fn(() => new URLSearchParams())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => useSearchParamsMock(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

vi.mock('@/features/reservations/hooks/use-admin-reservations', () => ({
  buildAdminReservationsKey: vi.fn(),
  useAdminReservations: vi.fn(),
}))

vi.mock('@/features/reservations/hooks/use-delete-admin-reservation', () => ({
  useDeleteAdminReservation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

import { useAdminReservations } from '@/features/reservations/hooks/use-admin-reservations'

type UseAdminReservationsReturn = ReturnType<typeof useAdminReservations>

const RESERVATION_ID = '11111111-1111-4111-8111-111111111111'
const USER_ID = '22222222-2222-4222-8222-222222222222'
const ITEM_ID = '33333333-3333-4333-8333-333333333333'
const LIST_ID = '44444444-4444-4444-8444-444444444444'

const BASE_RESERVATION: ApiAdminReservation = {
  id: RESERVATION_ID,
  quantityBooked: 2,
  createdAt: '2024-02-01T00:00:00.000Z',
  listItem: {
    id: 'li-1',
    itemId: ITEM_ID,
    name: 'Weighted blanket',
    quantityDesired: 3,
    image: null,
  },
  list: {
    id: LIST_ID,
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

function mockReservationsResult(
  data: ApiAdminReservation[] | null,
  overrides: Partial<UseAdminReservationsReturn> = {},
): void {
  const response =
    data === null
      ? undefined
      : {
          items: data,
          pagination: { page: 1, limit: 20, total: data.length, totalPages: 1 },
        }
  vi.mocked(useAdminReservations).mockReturnValue({
    data: response,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as UseAdminReservationsReturn)
}

function render(ui: ReactElement): void {
  renderWithQueryClient(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>)
}

beforeEach(() => {
  vi.clearAllMocks()
  useSearchParamsMock.mockReturnValue(new URLSearchParams())
})

describe('ReservationsList', () => {
  it('renders reserver, item and list as links to their respective pages', () => {
    mockReservationsResult([BASE_RESERVATION])
    render(<ReservationsList />)
    const reserverLink = screen.getByRole('link', { name: new RegExp(`reserver.*${USER_ID}`) })
    expect(reserverLink).toHaveAttribute('href', `/users?id=${USER_ID}`)
    const itemLink = screen.getByRole('link', { name: 'Weighted blanket' })
    expect(itemLink).toHaveAttribute('href', `/items?id=${ITEM_ID}`)
    const listLink = screen.getByRole('link', { name: 'Wedding wishlist' })
    expect(listLink).toHaveAttribute('href', `/lists?id=${LIST_ID}`)
    expect(screen.getByText(/wedding · no owner/)).toBeInTheDocument()
  })

  it('renders the owner suffix when the list has an owner', () => {
    const ownerUser = { ...BASE_RESERVATION.user, id: 'owner-1', username: 'owner_user' }
    mockReservationsResult([
      {
        ...BASE_RESERVATION,
        list: { ...BASE_RESERVATION.list, owner: ownerUser },
      },
    ])
    render(<ReservationsList />)
    expect(screen.getByText(/wedding · by owner_user/)).toBeInTheDocument()
  })

  it('shows the empty state when there are no reservations', () => {
    mockReservationsResult([])
    render(<ReservationsList />)
    expect(screen.getByText('No reservations match these filters.')).toBeInTheDocument()
  })

  it('renders the user, list and item filters', () => {
    mockReservationsResult([])
    render(<ReservationsList />)
    expect(screen.getByLabelText('User ID')).toBeInTheDocument()
    expect(screen.getByLabelText('List ID')).toBeInTheDocument()
    expect(screen.getByLabelText('Item ID')).toBeInTheDocument()
  })

  it('renders a retry button on error', () => {
    mockReservationsResult(null, {
      isError: true,
      error: new Error('Boom'),
    })
    render(<ReservationsList />)
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    expect(screen.getByText('Boom')).toBeInTheDocument()
  })

  it('exposes a cancel action button per row', () => {
    mockReservationsResult([BASE_RESERVATION])
    render(<ReservationsList />)
    expect(screen.getByRole('button', { name: 'Cancel reservation' })).toBeInTheDocument()
  })
})
