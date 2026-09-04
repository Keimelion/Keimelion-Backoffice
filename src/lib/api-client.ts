import type { ApiError } from '@keimelion/api/shared/types/api'
import { clearAccessToken, getAccessToken } from '@/features/auth/auth-storage'
import { queryClient } from '@/lib/query-client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
const API_V1_URL = `${API_BASE_URL}/v1`

const LOGIN_PATH = '/auth/login'

let redirectInFlight = false

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

function buildAuthHeaders(): Record<string, string> {
  const token = getAccessToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

function handleUnauthorized(path: string): void {
  if (path === LOGIN_PATH) return
  if (redirectInFlight) return
  redirectInFlight = true
  clearAccessToken()
  queryClient.clear()
  window.location.assign('/login')
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const authHeaders = buildAuthHeaders()
  const existingHeaders = options?.headers instanceof Headers
    ? Object.fromEntries(options.headers.entries())
    : (options?.headers as Record<string, string> | undefined) ?? {}

  const response = await fetch(`${API_V1_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...existingHeaders,
    },
  })

  if (response.status === 401) {
    handleUnauthorized(path)
    throw new ApiRequestError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  if (response.status === 204) {
    return null as T
  }

  const body = (await response.json()) as T | ApiError

  if (!response.ok) {
    const error = body as ApiError
    throw new ApiRequestError(error.code, error.message, response.status)
  }

  return body as T
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
