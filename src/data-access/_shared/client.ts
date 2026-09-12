import type { ApiError } from '@keimelion/api/shared/types/api'
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  rotateTokens,
} from '@/data-access/_shared/auth-storage'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
const API_V1_URL = `${API_BASE_URL}/v1`

const REFRESH_PATH = '/auth/refresh'
const LOGIN_PATH = '/auth/login'

export class ApiRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

let refreshPromise: Promise<string> | null = null

function isRefreshExemptPath(path: string): boolean {
  return path === REFRESH_PATH || path === LOGIN_PATH
}

function buildAuthHeaders(token: string | null): Record<string, string> {
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

async function executeTokenRefresh(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearSession()
    window.location.assign('/login')
    throw new ApiRequestError('NO_REFRESH_TOKEN', 'No refresh token available', 401)
  }

  const response = await fetch(`${API_V1_URL}${REFRESH_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    clearSession()
    window.location.assign('/login')
    throw new ApiRequestError('REFRESH_FAILED', 'Session expired, please log in again', 401)
  }

  const body = (await response.json()) as { accessToken: string; refreshToken: string }
  rotateTokens(body.accessToken, body.refreshToken)
  return body.accessToken
}

export function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise

  refreshPromise = executeTokenRefresh().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

async function fetchOnce(path: string, token: string | null, options?: RequestInit): Promise<Response> {
  const existingHeaders = (options?.headers as Record<string, string> | undefined) ?? {}
  try {
    return await fetch(`${API_V1_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeaders(token),
        ...existingHeaders,
      },
    })
  } catch {
    throw new ApiRequestError(
      'NETWORK_ERROR',
      'Cannot reach the server. Check your connection and that the API is running.',
      0,
    )
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return null as T

  let body: T | ApiError
  try {
    body = (await response.json()) as T | ApiError
  } catch {
    throw new ApiRequestError(
      'INVALID_RESPONSE',
      `The server returned a non-JSON response (status ${String(response.status)}). Check that NEXT_PUBLIC_API_URL is correct and the API is reachable.`,
      response.status,
    )
  }

  if (!response.ok) {
    const error = body as ApiError
    throw new ApiRequestError(error.code, error.message, response.status)
  }

  return body as T
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const firstResponse = await fetchOnce(path, getAccessToken(), options)

  if (firstResponse.status === 401 && !isRefreshExemptPath(path)) {
    const newAccessToken = await refreshAccessToken()
    const retryResponse = await fetchOnce(path, newAccessToken, options)
    return parseResponse<T>(retryResponse)
  }

  return parseResponse<T>(firstResponse)
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path)
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function apiDelete(path: string): Promise<void> {
  await request<null>(path, { method: 'DELETE' })
}
