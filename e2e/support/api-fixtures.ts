import type {
  AdminFeedbackListResponseInput,
  AdminItemsGetResponseInput,
  AdminItemsListResponseInput,
  AdminListsListResponseInput,
  AdminShopsListResponseInput,
  AdminUsersListResponseInput,
  HealthGetResponseInput,
  LoginResponseInput,
  OccasionTypesListResponseInput,
} from '@keimelion/sdk/schemas'

const FIXED_TIMESTAMP = '2026-01-15T10:00:00.000Z'
const SINGLE_PAGE = { page: 1, limit: 20, total: 2, totalPages: 1 }

export const HEALTH_RESPONSE: HealthGetResponseInput = {
  status: 'ok',
  database: 'ok',
  timestamp: FIXED_TIMESTAMP,
  version: '0.0.0-e2e',
}

export const ADMIN_CREDENTIALS = {
  email: 'admin@keimelion.app',
  password: 'Admin-password-1',
}

const ADMIN_USER = {
  id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  email: ADMIN_CREDENTIALS.email,
  username: 'admin',
  authProvider: 'email' as const,
  role: 'admin' as const,
  status: 'active' as const,
  avatarImageId: null,
  avatar: null,
  isCgvAccepted: true,
  cgvAcceptedAt: FIXED_TIMESTAMP,
  isMarketingOptedIn: false,
  defaultCurrency: 'EUR' as const,
  emailVerifiedAt: FIXED_TIMESTAMP,
  lastActiveAt: FIXED_TIMESTAMP,
  createdAt: FIXED_TIMESTAMP,
  updatedAt: FIXED_TIMESTAMP,
}

const OWNER_USER = {
  ...ADMIN_USER,
  id: '22222222-2222-4222-8222-222222222222',
  email: 'owner@example.com',
  username: 'owner',
  role: 'user' as const,
}

export const LOGIN_RESPONSE: LoginResponseInput = {
  accessToken: 'e2e-access-token',
  refreshToken: 'e2e-refresh-token',
  user: ADMIN_USER,
}

const ADMIN_ONLY_FIELDS = {
  bannedAt: null,
  banReason: null,
  deletedAt: null,
  activatedAt: FIXED_TIMESTAMP,
  reservationsCount: 0,
}

export const USERS_LIST_RESPONSE: AdminUsersListResponseInput = {
  items: [
    { ...ADMIN_USER, ...ADMIN_ONLY_FIELDS },
    { ...OWNER_USER, ...ADMIN_ONLY_FIELDS, reservationsCount: 2 },
  ],
  pagination: SINGLE_PAGE,
}

const ITEM = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  name: 'Wool blanket',
  description: 'A warm blanket for winter evenings.',
  imageId: null,
  image: null,
  gtin: null,
  createdByUserId: null,
  createdAt: FIXED_TIMESTAMP,
  updatedAt: FIXED_TIMESTAMP,
  sources: [
    {
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      itemId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      shopId: null,
      shop: null,
      sourceUrl: 'https://example.com/wool-blanket',
      price: '49.90',
      currency: 'EUR' as const,
      createdAt: FIXED_TIMESTAMP,
      updatedAt: FIXED_TIMESTAMP,
    },
  ],
  categories: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      parentId: null,
      name: 'Home',
      slug: 'home',
      depth: 0,
    },
  ],
  tags: [],
  reservationCount: 1,
}

const SECOND_ITEM = {
  ...ITEM,
  id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  name: 'Ceramic mug',
  description: null,
  sources: [],
  reservationCount: 0,
}

export const ITEMS_LIST_RESPONSE: AdminItemsListResponseInput = {
  items: [ITEM, SECOND_ITEM],
  pagination: SINGLE_PAGE,
}

export const SHOPS_LIST_RESPONSE: AdminShopsListResponseInput = {
  items: [],
  pagination: { ...SINGLE_PAGE, total: 0, totalPages: 0 },
}

export const ITEM_DETAIL_RESPONSE: AdminItemsGetResponseInput = { item: ITEM }

const BIRTHDAY_OCCASION_TYPE_ID = '33333333-3333-4333-8333-333333333333'

export const OCCASION_TYPES_LIST_RESPONSE: OccasionTypesListResponseInput = [
  { id: BIRTHDAY_OCCASION_TYPE_ID, slug: 'birthday', label: 'Birthday', emoji: null },
]

export const LISTS_LIST_RESPONSE: AdminListsListResponseInput = {
  items: [
    {
      id: '44444444-4444-4444-8444-444444444444',
      title: 'Birthday',
      slug: 'birthday',
      description: null,
      listStatus: 'active',
      occasionTypeId: BIRTHDAY_OCCASION_TYPE_ID,
      owner: OWNER_USER,
      tags: [],
      itemCount: 3,
      totalEstimatedPrice: '42.00',
      displayCurrency: 'EUR',
      deletedAt: null,
      createdAt: FIXED_TIMESTAMP,
      updatedAt: FIXED_TIMESTAMP,
    },
  ],
  pagination: { ...SINGLE_PAGE, total: 1 },
}

export const FEEDBACK_LIST_RESPONSE: AdminFeedbackListResponseInput = {
  items: [
    {
      id: '55555555-5555-4555-8555-555555555555',
      userId: OWNER_USER.id,
      title: 'Something is off',
      description: 'The reservation badge is misaligned on mobile.',
      context: { route: '/lists/42' },
      status: 'open',
      createdAt: FIXED_TIMESTAMP,
      updatedAt: FIXED_TIMESTAMP,
      user: { id: OWNER_USER.id, username: OWNER_USER.username, email: OWNER_USER.email },
    },
  ],
  pagination: { ...SINGLE_PAGE, total: 1 },
}
