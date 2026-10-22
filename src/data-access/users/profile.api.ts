import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import type { ApiUser } from '@/data-access/_shared/user'
import {
  changePasswordResponseSchema,
  profileResponseSchema,
  type ChangePasswordApiInput,
  type ChangePasswordResponse,
  type UpdateProfileInput,
} from './profile.schemas'

const PROFILE_PATH = '/users/me'
const CHANGE_PASSWORD_PATH = '/users/me/change-password'

export async function getMe(): Promise<ApiUser> {
  const response = await axiosInstance.get<unknown>(PROFILE_PATH)
  const parsed = parseApiResponse(profileResponseSchema, response, 'profile')
  return parsed.user
}

export async function updateMe(input: UpdateProfileInput): Promise<ApiUser> {
  const response = await axiosInstance.patch<unknown>(PROFILE_PATH, input)
  const parsed = parseApiResponse(profileResponseSchema, response, 'profile')
  return parsed.user
}

export async function changeMyPassword(
  input: ChangePasswordApiInput,
): Promise<ChangePasswordResponse> {
  const response = await axiosInstance.post<unknown>(CHANGE_PASSWORD_PATH, input)
  return parseApiResponse(changePasswordResponseSchema, response, 'change-password')
}
