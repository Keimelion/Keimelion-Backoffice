import type { ApiError } from '@keimelion/api/shared/types/api'

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? ''
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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_V1_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  })

  if (response.status === 204) {
    return null as T
  }

  const body = await response.json() as T | ApiError

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

export function apiDelete(path: string): Promise<void> {
  return request<void>(path, { method: 'DELETE' })
}
