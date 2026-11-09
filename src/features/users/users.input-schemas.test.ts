import { describe, expect, it } from 'vitest'
import {
  createAdminUserInputSchema,
  updateAdminUserInputSchema,
} from '@/features/users/users.input-schemas'

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
