import axios, { AxiosHeaders } from 'axios'
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  rotateTokens,
} from '@/data-access/_shared/auth-storage'
import { refreshResponseSchema } from '@/data-access/auth/auth.schemas'

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

  const rawBody: unknown = await response.json()
  const parsed = refreshResponseSchema.safeParse(rawBody)
  if (!parsed.success) {
    clearSession()
    window.location.assign('/login')
    throw new ApiRequestError('REFRESH_FAILED', 'Session expired, please log in again', 401)
  }

  rotateTokens(parsed.data.accessToken, parsed.data.refreshToken)
  return parsed.data.accessToken
}

export function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise

  refreshPromise = executeTokenRefresh().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

function mapAxiosError(axiosError: AxiosError<{ code: string; message: string }>): ApiRequestError {
  const status = axiosError.response?.status ?? 0

  if (!axiosError.response) {
    return new ApiRequestError(
      'NETWORK_ERROR',
      'Cannot reach the server. Check your connection and that the API is running.',
      status,
    )
  }

  const body = axiosError.response.data
  if (body.code && body.message) {
    return new ApiRequestError(body.code, body.message, status)
  }

  return new ApiRequestError(
    'INVALID_RESPONSE',
    `The server returned an unexpected response (status ${String(status)}). Check that NEXT_PUBLIC_API_URL is correct and the API is reachable.`,
    status,
  )
}

function buildRetryHeaders(originalConfig: InternalAxiosRequestConfig, newToken: string): AxiosHeaders {
  const headers = new AxiosHeaders(originalConfig.headers)
  headers.setAuthorization(`Bearer ${newToken}`)
  return headers
}

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_V1_URL,
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.setAuthorization(`Bearer ${token}`)
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as AxiosError<{ code: string; message: string }>
    const originalConfig = axiosError.config
    const requestPath = originalConfig?.url ?? ''
    const status = axiosError.response?.status

    if (status === 401 && !isRefreshExemptPath(requestPath) && originalConfig) {
      const newAccessToken = await refreshAccessToken()
      return axiosInstance.request({
        ...originalConfig,
        headers: buildRetryHeaders(originalConfig, newAccessToken),
      })
    }

    throw mapAxiosError(axiosError)
  },
)

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  const response = await axiosInstance.request<T>({
    url: path,
    method,
    data: body,
  })

  if (response.status === 204) return null as T
  return response.data
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, 'GET')
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, 'POST', body)
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, 'PATCH', body)
}

export async function apiDelete(path: string): Promise<void> {
  await request<null>(path, 'DELETE')
}
