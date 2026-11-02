'use client'

import { useSearchParams } from 'next/navigation'
import type { z } from 'zod'

export function useListSearchParams<T>(schema: z.ZodType<T>): T {
  const searchParams = useSearchParams()
  const raw = Object.fromEntries(searchParams.entries())
  return parseWithFallback(schema, raw)
}

function parseWithFallback<T>(
  schema: z.ZodType<T>,
  raw: Record<string, string>,
): T {
  const dropped = parseDroppingInvalidKeys(schema, raw)
  if (dropped !== null) return dropped
  const partial = parseLargestValidSubset(schema, raw)
  if (partial !== null) return partial
  return schema.parse({})
}

function parseDroppingInvalidKeys<T>(
  schema: z.ZodType<T>,
  raw: Record<string, string>,
): T | null {
  const result = schema.safeParse(raw)
  if (result.success) return result.data
  const invalidKeys = new Set<string>()
  for (const issue of result.error.issues) {
    const topKey = issue.path[0]
    if (typeof topKey === 'string') invalidKeys.add(topKey)
  }
  if (invalidKeys.size === 0) return null
  const filtered = Object.fromEntries(
    Object.entries(raw).filter(([key]) => !invalidKeys.has(key)),
  )
  if (Object.keys(filtered).length === Object.keys(raw).length) return null
  return parseDroppingInvalidKeys(schema, filtered)
}

function parseLargestValidSubset<T>(
  schema: z.ZodType<T>,
  raw: Record<string, string>,
): T | null {
  for (const dropped of Object.keys(raw)) {
    const subset = Object.fromEntries(
      Object.entries(raw).filter(([key]) => key !== dropped),
    )
    const result = schema.safeParse(subset)
    if (result.success) return result.data
  }
  return null
}
