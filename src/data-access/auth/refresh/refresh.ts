import axios from 'axios'
import { z } from 'zod'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { rotateTokens } from '@/data-access/_shared/auth-storage'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
const API_V1_URL = `${API_BASE_URL}/v1`

const REFRESH_PATH = '/auth/refresh'

const refreshResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
})

export const refreshHttp = axios.create({
  baseURL: API_V1_URL,
  headers: { 'Content-Type': 'application/json' },
})

export async function refreshTokens(refreshToken: string): Promise<string> {
  const response = await refreshHttp.post<unknown>(REFRESH_PATH, { refreshToken })
  const parsed = refreshResponseSchema.safeParse(response.data)
  if (!parsed.success) {
    throw new ApiRequestError(
      'REFRESH_FAILED',
      'Session expired, please log in again',
      response.status,
    )
  }
  rotateTokens(parsed.data.accessToken, parsed.data.refreshToken)
  return parsed.data.accessToken
}
