import type { AdminUserDetailParsed } from '@keimelion/sdk/schemas'

export const USER_ID = '55555555-5555-4555-8555-555555555555'

export function buildAdminUser(overrides: Partial<AdminUserDetailParsed> = {}): AdminUserDetailParsed {
  return {
    id: USER_ID,
    email: 'invited.moderator@keimelion.app',
    username: null,
    authProvider: 'email',
    role: 'moderator',
    avatarImageId: null,
    avatar: null,
    isCgvAccepted: false,
    cgvAcceptedAt: null,
    isMarketingOptedIn: false,
    defaultCurrency: 'EUR',
    emailVerifiedAt: null,
    lastActiveAt: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    bannedAt: null,
    banReason: null,
    deletedAt: null,
    activatedAt: null,
    status: 'invited',
    reservationsCount: 0,
    ...overrides,
  }
}
