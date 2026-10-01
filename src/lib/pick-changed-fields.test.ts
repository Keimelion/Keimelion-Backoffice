import { describe, expect, it } from 'vitest'
import { pickChangedFields } from './pick-changed-fields'

interface Entity {
  id: string
  name: string
  age: number
  active: boolean
  tag: string | null
}

const ENTITY: Entity = {
  id: 'abc',
  name: 'Alice',
  age: 30,
  active: true,
  tag: null,
}

describe('pickChangedFields', () => {
  it('returns only the keys whose values differ', () => {
    const patch = pickChangedFields(
      ENTITY,
      { ...ENTITY, name: 'Alice B.', age: 31 },
      ['name', 'age', 'active'] as const,
    )
    expect(patch).toEqual({ name: 'Alice B.', age: 31 })
  })

  it('returns an empty object when nothing changed', () => {
    const patch = pickChangedFields(ENTITY, { ...ENTITY }, ['name', 'age', 'active'] as const)
    expect(patch).toEqual({})
  })

  it('ignores keys outside the provided key list', () => {
    const patch = pickChangedFields(ENTITY, { ...ENTITY, id: 'other' }, ['name', 'age'] as const)
    expect(patch).toEqual({})
  })

  it('includes a key that changed from null to a value', () => {
    const after: Entity = { ...ENTITY, tag: 'vip' }
    const patch = pickChangedFields(ENTITY, after, ['tag'] as const)
    expect(patch).toEqual({ tag: 'vip' })
  })

  it('includes a key that changed from a value to null', () => {
    const before: Entity = { ...ENTITY, tag: 'vip' }
    const after: Entity = { ...before, tag: null }
    const patch = pickChangedFields(before, after, ['tag'] as const)
    expect(patch).toEqual({ tag: null })
  })

  it('accepts a wider "before" (Partial-compatible superset)', () => {
    interface Wider extends Entity {
      createdAt: string
    }
    const wider: Wider = { ...ENTITY, createdAt: '2026-01-01' }
    const patch = pickChangedFields<Entity, 'name'>(
      wider,
      { ...ENTITY, name: 'Alice B.' },
      ['name'] as const,
    )
    expect(patch).toEqual({ name: 'Alice B.' })
  })
})
