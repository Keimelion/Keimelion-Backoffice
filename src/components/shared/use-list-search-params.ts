'use client'

import { useSearchParams } from 'next/navigation'
import type { z } from 'zod'

export function useListSearchParams<T>(schema: z.ZodType<T>): T {
  const searchParams = useSearchParams()
  const raw = Object.fromEntries(searchParams.entries())
  const result = schema.safeParse(raw)
  if (result.success) return result.data
  return schema.parse({})
}
