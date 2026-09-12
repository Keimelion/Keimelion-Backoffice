import type { AuthProvider } from '@keimelion/api/shared/enums/auth-provider'
import type { UserRole } from '@keimelion/api/shared/enums/user-role'
import { apiPost } from '@/data-access/_shared/client'
import type { LoginInput } from '@/data-access/auth/auth.schemas'

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

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: ApiUser
}

export interface ForgotPasswordApiInput {
  email: string
}

export interface ResetPasswordApiInput {
  token: string
  newPassword: string
}

export interface MessageResponse {
  message: string
}

export function loginApi(input: LoginInput): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/login', input)
}

export async function logoutApi(): Promise<void> {
  await apiPost<null>('/auth/logout', {})
}

export function forgotPasswordApi(input: ForgotPasswordApiInput): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/auth/forgot-password', input)
}

export function resetPasswordApi(input: ResetPasswordApiInput): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/auth/reset-password', {
    passwordResetToken: input.token,
    password: input.newPassword,
  })
}
