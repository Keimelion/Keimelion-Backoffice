'use client'

import { useQuery } from '@tanstack/react-query'
import type { ApiUser } from '@/data-access/auth/auth.api'

export const CURRENT_USER_QUERY_KEY = ['currentUser'] as const

/**
 * Read the current user from the TanStack Query cache. Reactive: consumers
 * re-render when the cache entry changes — login seeds it, logout / 401
 * clear it, AuthBootstrap hydrates it from localStorage on mount.
 *
 * Returns null before AuthBootstrap runs or when no user is signed in.
 *
 * When a GET /auth/me endpoint lands, add a queryFn here and drop
 * `enabled: false` so the query becomes an actual remote read.
 */
export function useCurrentUser(): ApiUser | null {
  const { data } = useQuery<ApiUser | null>({
    queryKey: CURRENT_USER_QUERY_KEY,
    enabled: false,
    initialData: null,
  })
  return data
}
