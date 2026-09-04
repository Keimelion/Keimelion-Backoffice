import type { AuthProvider } from '@keimelion/api/shared/enums/auth-provider'
import type { UserRole } from '@keimelion/api/shared/enums/user-role'
import { apiPost } from '@/lib/api-client'

// ApiUser mirrors the API response shape — dates are strings over JSON
export interface ApiUser {
  id: string
  email: string
  username: string | null
  authProvider: AuthProvider
  role: UserRole
  avatarUrl: string | null
  isCgvAccepted: boolean
  cgvAcceptedAt: string | null
  isMarketingOptedIn: boolean
  emailVerifiedAt: string | null
  lastActiveAt: string | null
  createdAt: string
  updatedAt: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: ApiUser
}

export interface RegisterInput {
  email: string
  password: string
}

export function loginApi(input: LoginInput): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/login', input)
}

export async function logoutApi(): Promise<void> {
  await apiPost<null>('/auth/logout', {})
}

export function registerApi(input: RegisterInput): Promise<{ user: ApiUser }> {
  return apiPost<{ user: ApiUser }>('/auth/register', input)
}
