import type { ApiError } from '@keimelion/api/shared/types/api'
import { getAccessToken } from '@/lib/auth-storage'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
const API_V1_URL = `${API_BASE_URL}/v1`

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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const authHeaders = buildAuthHeaders()
  const existingHeaders = options?.headers instanceof Headers
    ? Object.fromEntries(options.headers.entries())
    : (options?.headers as Record<string, string> | undefined) ?? {}

  let response: Response
  try {
    response = await fetch(`${API_V1_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
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

  if (response.status === 204) {
    return null as T
  }

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
