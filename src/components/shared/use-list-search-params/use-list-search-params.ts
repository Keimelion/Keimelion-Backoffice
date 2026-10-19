'use client'

import { useSearchParams } from 'next/navigation'
import type { z } from 'zod'

export function useListSearchParams<T>(schema: z.ZodType<T>): T {
  const searchParams = useSearchParams()
  const raw = Object.fromEntries(searchParams.entries())
  return parseDroppingInvalidKeys(schema, raw)
}

function parseDroppingInvalidKeys<T>(
  schema: z.ZodType<T>,
  raw: Record<string, string>,
): T {
  const result = schema.safeParse(raw)
  if (result.success) return result.data
  const invalidKeys = new Set<string>()
  for (const issue of result.error.issues) {
    const topKey = issue.path[0]
    if (typeof topKey === 'string') invalidKeys.add(topKey)
  }
  if (invalidKeys.size === 0) return schema.parse({})
  const filtered = Object.fromEntries(
    Object.entries(raw).filter(([key]) => !invalidKeys.has(key)),
  )
  if (Object.keys(filtered).length === Object.keys(raw).length) {
    return schema.parse({})
  }
  return parseDroppingInvalidKeys(schema, filtered)
}
