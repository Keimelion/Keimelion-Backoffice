'use client'

import { useEffect } from 'react'
import {
  startAutoRefresh,
  stopAutoRefresh,
} from '@/data-access/_shared/auth-storage/refresh-scheduler'

export function useAuthSession(): void {
  useEffect(() => {
    startAutoRefresh()
    return stopAutoRefresh
  }, [])
}
