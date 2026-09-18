import { describe, expect, it } from 'vitest'
import {
  adminUserMutationUserSchema,
  adminUserMutationResponseSchema,
  createAdminUserInputSchema,
  updateAdminUserInputSchema,
} from './admin-users.schemas'

const MOCK_MUTATION_USER = {
  id: 'u-1',
  email: 'user@keimelion.app',
  username: 'testuser',
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

describe('adminUserMutationUserSchema', () => {
  it('parses a full user object', () => {
    const result = adminUserMutationUserSchema.safeParse(MOCK_MUTATION_USER)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.id).toBe('u-1')
    expect(result.data.email).toBe('user@keimelion.app')
    expect(result.data.role).toBe('user')
  })

  it('parses a user with null nullable fields', () => {
    const result = adminUserMutationUserSchema.safeParse({
      ...MOCK_MUTATION_USER,
      username: null,
      avatarUrl: null,
      deletedAt: null,
      bannedAt: null,
    })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.username).toBeNull()
  })

  it('fails when required fields are missing', () => {
    const result = adminUserMutationUserSchema.safeParse({ id: 'u-1' })
    expect(result.success).toBe(false)
  })

  it('fails for an invalid role value', () => {
    const result = adminUserMutationUserSchema.safeParse({
      ...MOCK_MUTATION_USER,
      role: 'superadmin',
    })
    expect(result.success).toBe(false)
  })
})

describe('adminUserMutationResponseSchema', () => {
  it('parses a valid mutation response', () => {
    const raw = { user: MOCK_MUTATION_USER }
    const result = adminUserMutationResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.user.id).toBe('u-1')
  })

  it('fails when the user field is missing', () => {
    const result = adminUserMutationResponseSchema.safeParse({})
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

  it('parses a full create input with all optional fields', () => {
    const result = createAdminUserInputSchema.safeParse({
      email: 'new@keimelion.app',
      username: 'newuser',
      displayName: 'New User',
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
