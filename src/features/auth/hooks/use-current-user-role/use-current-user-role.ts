'use client'

import type { UserRole } from '@keimelion/api/shared/enums/user-role'
import { getStoredUser } from '@/data-access/_shared/auth-storage'

export function useCurrentUserRole(): UserRole | null {
  const user = getStoredUser()
  return user?.role ?? null
}
