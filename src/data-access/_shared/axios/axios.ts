import axios, { AxiosHeaders } from 'axios'
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { z } from 'zod'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { clearSession, getAccessToken, getRefreshToken } from '@/data-access/_shared/auth-storage'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { refreshTokens } from '@/data-access/auth/refresh'
import { useLocaleStore } from '@/lib/i18n/locale-store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
const API_V1_URL = `${API_BASE_URL}/v1`

const REFRESH_PATH = '/auth/refresh'
const LOGIN_ROUTE = '/auth/login'
const LOGIN_REDIRECT = '/login'

const apiErrorBodySchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
})

let refreshPromise: Promise<string> | null = null

function isRefreshExemptPath(path: string): boolean {
  return path === REFRESH_PATH || path === LOGIN_ROUTE
}

function abortRefresh(code: string, message: string): never {
  clearSession()
  window.location.assign(LOGIN_REDIRECT)
  throw new ApiRequestError(code, message, HttpStatus.UNAUTHORIZED)
}

async function executeTokenRefresh(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    abortRefresh('NO_REFRESH_TOKEN', 'No refresh token available')
  }
  try {
    return await refreshTokens(refreshToken)
  } catch {
    abortRefresh('REFRESH_FAILED', 'Session expired, please log in again')
  }
}

export function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise

  refreshPromise = executeTokenRefresh().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

function mapAxiosError(axiosError: AxiosError): ApiRequestError {
  const status = axiosError.response?.status ?? 0

  if (!axiosError.response) {
    return new ApiRequestError(
      'NETWORK_ERROR',
      'Cannot reach the server. Check your connection and that the API is running.',
      status,
    )
  }

  const parsedBody = apiErrorBodySchema.safeParse(axiosError.response.data)
  if (parsedBody.success) {
    return new ApiRequestError(parsedBody.data.code, parsedBody.data.message, status)
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
  const locale = useLocaleStore.getState().locale
  config.headers.set('Accept-Language', locale)
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as AxiosError
    const originalConfig = axiosError.config
    const requestPath = originalConfig?.url ?? ''
    const status = axiosError.response?.status

    if (status === HttpStatus.UNAUTHORIZED && !isRefreshExemptPath(requestPath) && originalConfig) {
      const newAccessToken = await refreshAccessToken()
      return axiosInstance.request({
        ...originalConfig,
        headers: buildRetryHeaders(originalConfig, newAccessToken),
      })
    }

    throw mapAxiosError(axiosError)
  },
)
