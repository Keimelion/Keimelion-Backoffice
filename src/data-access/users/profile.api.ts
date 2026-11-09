import type {
  MessageResponseParsed,
  UserDetailParsed,
  UsersChangePasswordRequestInput,
  UsersUpdateProfileRequestInput,
} from '@keimelion/sdk/schemas'
import { apiClient } from '@/data-access/_shared/client'

const AVATAR_FIELD = 'image'

export async function getMe(): Promise<UserDetailParsed> {
  const { user } = await apiClient.users.getProfile()
  return user
}

export async function updateMe(
  input: UsersUpdateProfileRequestInput,
  avatar: File | null,
): Promise<UserDetailParsed> {
  if (avatar === null) {
    const { user } = await apiClient.users.updateProfile(input)
    return user
  }
  const { username, ...fields } = input
  if (username === null) await apiClient.users.updateProfile({ username: null })
  const { user } = await apiClient.users.updateProfile(
    buildProfileFormData({ ...fields, ...(typeof username === 'string' && { username }) }, avatar),
  )
  return user
}

export async function changeMyPassword(
  input: UsersChangePasswordRequestInput,
): Promise<MessageResponseParsed> {
  return apiClient.users.changePassword(input)
}

function buildProfileFormData(input: UsersUpdateProfileRequestInput, avatar: File): FormData {
  const formData = new FormData()
  if (typeof input.username === 'string') formData.set('username', input.username)
  if (input.isMarketingOptedIn !== undefined) {
    formData.set('isMarketingOptedIn', String(input.isMarketingOptedIn))
  }
  if (input.defaultCurrency !== undefined) formData.set('defaultCurrency', input.defaultCurrency)
  formData.set(AVATAR_FIELD, avatar)
  return formData
}
