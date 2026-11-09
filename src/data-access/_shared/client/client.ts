import { ApiError, createClient } from '@keimelion/sdk/client'
import type { KeimelionClient } from '@keimelion/sdk/client'
import { HttpStatus } from '@keimelion/sdk/enums'
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  rotateTokens,
} from '@/data-access/_shared/auth-storage'
import { useLocaleStore } from '@/lib/i18n/locale-store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
const LOGIN_REDIRECT = '/login'
const ACCEPT_LANGUAGE_HEADER = 'Accept-Language'
const NO_REFRESH_TOKEN_CODE = 'NO_REFRESH_TOKEN'
const REFRESH_FAILED_CODE = 'REFRESH_FAILED'

let refreshPromise: Promise<string> | null = null

export const apiClient: KeimelionClient = createClient({
  baseUrl: API_BASE_URL,
  getToken: getAccessToken,
  fetch: fetchWithAppLocale,
  onUnauthorized: renewSession,
})

export function refreshAccessToken(): Promise<string> {
  refreshPromise ??= executeTokenRefresh().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

function fetchWithAppLocale(url: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set(ACCEPT_LANGUAGE_HEADER, useLocaleStore.getState().locale)
  return globalThis.fetch(url, { ...init, headers })
}

async function renewSession(): Promise<boolean> {
  await refreshAccessToken()
  return true
}

async function executeTokenRefresh(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (refreshToken === null) {
    return endSession(NO_REFRESH_TOKEN_CODE, 'No refresh token available')
  }
  try {
    const tokens = await apiClient.auth.refresh({ refreshToken })
    rotateTokens(tokens.accessToken, tokens.refreshToken)
    return tokens.accessToken
  } catch (cause: unknown) {
    return endSession(REFRESH_FAILED_CODE, 'Session expired, please log in again', cause)
  }
}

function endSession(code: string, message: string, cause?: unknown): never {
  clearSession()
  window.location.assign(LOGIN_REDIRECT)
  throw new ApiError({ status: HttpStatus.UNAUTHORIZED, code, message, metadata: {}, cause })
}
