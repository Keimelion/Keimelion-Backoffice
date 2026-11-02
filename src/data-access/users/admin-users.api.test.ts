import { beforeEach, describe, expect, it } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { axiosInstance } from '@/data-access/_shared/axios'
import { listUsers } from './admin-users.api'
import {
  adminUserMutationResponseSchema,
  createAdminUserInputSchema,
  updateAdminUserInputSchema,
} from './admin-users.schemas'

const MOCK_MUTATION_USER = {
  id: 'u-1',
  email: 'user@keimelion.app',
  username: 'testuser',
  authProvider: 'email',
  role: 'user',
  avatarUrl: null,
  isCgvAccepted: false,
  cgvAcceptedAt: null,
  isMarketingOptedIn: false,
  emailVerifiedAt: '2024-01-01T00:00:00.000Z',
  lastActiveAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  bannedAt: null,
  banReason: null,
  deletedAt: null,
}

describe('adminUserMutationResponseSchema', () => {
  it('parses a valid mutation response', () => {
    const raw = { user: MOCK_MUTATION_USER }
    const result = adminUserMutationResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.user.id).toBe('u-1')
    expect(result.data.user.role).toBe('user')
  })

  it('parses a user with null nullable fields', () => {
    const result = adminUserMutationResponseSchema.safeParse({
      user: { ...MOCK_MUTATION_USER, username: null, avatarUrl: null },
    })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.user.username).toBeNull()
  })

  it('fails when the user field is missing', () => {
    const result = adminUserMutationResponseSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('fails for an invalid role value', () => {
    const result = adminUserMutationResponseSchema.safeParse({
      user: { ...MOCK_MUTATION_USER, role: 'superadmin' },
    })
    expect(result.success).toBe(false)
  })
})

describe('createAdminUserInputSchema', () => {
  it('parses a minimal valid create input (email + role only)', () => {
    const result = createAdminUserInputSchema.safeParse({
      email: 'new@keimelion.app',
      role: 'user',
    })
    expect(result.success).toBe(true)
  })

  it('parses a full create input with username', () => {
    const result = createAdminUserInputSchema.safeParse({
      email: 'new@keimelion.app',
      username: 'newuser',
      role: 'admin',
    })
    expect(result.success).toBe(true)
  })

  it('fails for an invalid email', () => {
    const result = createAdminUserInputSchema.safeParse({
      email: 'not-an-email',
      role: 'user',
    })
    expect(result.success).toBe(false)
  })

  it('fails for an invalid role', () => {
    const result = createAdminUserInputSchema.safeParse({
      email: 'new@keimelion.app',
      role: 'superadmin',
    })
    expect(result.success).toBe(false)
  })

  it('fails when email is missing', () => {
    const result = createAdminUserInputSchema.safeParse({ role: 'user' })
    expect(result.success).toBe(false)
  })

  it('fails for a username that is too short', () => {
    const result = createAdminUserInputSchema.safeParse({
      email: 'new@keimelion.app',
      username: 'ab',
      role: 'user',
    })
    expect(result.success).toBe(false)
  })

  it('rejects unknown fields (strict)', () => {
    const result = createAdminUserInputSchema.safeParse({
      email: 'new@keimelion.app',
      role: 'user',
      displayName: 'ignored',
    })
    expect(result.success).toBe(false)
  })
})

describe('updateAdminUserInputSchema', () => {
  it('parses a valid update input', () => {
    const result = updateAdminUserInputSchema.safeParse({ role: 'moderator' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.role).toBe('moderator')
  })

  it('fails when role is missing', () => {
    const result = updateAdminUserInputSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects unknown fields (strict)', () => {
    const result = updateAdminUserInputSchema.safeParse({
      role: 'user',
      unknownField: 'value',
    })
    expect(result.success).toBe(false)
  })
})

describe('listUsers', () => {
  let mock: MockAdapter
  let sentParams: unknown

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
    sentParams = undefined
    mock.onGet('/admin/users').reply((config) => {
      sentParams = config.params
      return [HttpStatus.OK, { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }]
    })
  })

  it('sends id, email, username and role as operator filters', async () => {
    await listUsers({
      page: 1,
      limit: 20,
      sort: 'createdAt:desc',
      id: '0b6f3c1e-1c1f-4f4e-9a55-3c5f0d7a2b11',
      email: 'alice',
      username: 'ali',
      role: 'moderator',
    })

    expect(sentParams).toEqual({
      page: 1,
      limit: 20,
      sort: 'createdAt:desc',
      'id[eq]': '0b6f3c1e-1c1f-4f4e-9a55-3c5f0d7a2b11',
      'email[ilike]': 'alice',
      'username[ilike]': 'ali',
      'role[eq]': 'moderator',
      currency: 'EUR',
    })
  })

  it('omits empty filters', async () => {
    await listUsers({ page: 1, limit: 20, email: '', username: '' })

    expect(sentParams).toEqual({ page: 1, limit: 20, currency: 'EUR' })
  })
})
