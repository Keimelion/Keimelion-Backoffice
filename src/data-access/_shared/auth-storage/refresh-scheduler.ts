import { clearSession, getAccessToken } from '@/data-access/_shared/auth-storage'
import { refreshAccessToken } from '@/data-access/_shared/client'

const REFRESH_LEAD_TIME_MS = 60 * 1000

let scheduledTimeoutId: ReturnType<typeof setTimeout> | null = null

interface JwtPayload {
  exp: number
}

function decodeJwtExpiry(token: string): number | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const payload = parts[1]
  if (!payload) return null

  try {
    const padded = payload + '=='.slice((payload.length + 2) % 4 === 0 ? 2 : (payload.length + 2) % 4)
    const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
    const parsed = JSON.parse(decoded) as JwtPayload
    return typeof parsed.exp === 'number' ? parsed.exp * 1000 : null
  } catch {
    return null
  }
}

function computeDelayMs(expiryMs: number): number {
  return Math.max(0, expiryMs - Date.now() - REFRESH_LEAD_TIME_MS)
}

function scheduleNextRefresh(): void {
  const token = getAccessToken()
  if (!token) return

  const expiryMs = decodeJwtExpiry(token)
  if (!expiryMs) return

  const delayMs = computeDelayMs(expiryMs)

  scheduledTimeoutId = setTimeout(() => {
    scheduledTimeoutId = null
    void executeScheduledRefresh()
  }, delayMs)
}

async function executeScheduledRefresh(): Promise<void> {
  try {
    await refreshAccessToken()
    scheduleNextRefresh()
  } catch {
    clearSession()
    window.location.assign('/login')
  }
}

export function startAutoRefresh(): void {
  if (typeof window === 'undefined') return
  stopAutoRefresh()
  scheduleNextRefresh()
}

export function stopAutoRefresh(): void {
  if (scheduledTimeoutId === null) return
  clearTimeout(scheduledTimeoutId)
  scheduledTimeoutId = null
}
