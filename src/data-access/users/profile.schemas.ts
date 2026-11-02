import { z } from 'zod'
import { SUPPORTED_CURRENCY_VALUES } from '@keimelion/api/shared/enums/currency'
import { apiUserSchema } from '@/data-access/_shared/user'

const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 72
const USERNAME_MIN_LENGTH = 1
const USERNAME_MAX_LENGTH = 100
const USERNAME_REGEX = /^[\p{L}\p{N}_-]+$/u

export const profileResponseSchema = z.object({
  user: apiUserSchema,
})

export type ProfileResponse = z.infer<typeof profileResponseSchema>

const trimmedUsernameSchema = z
  .string()
  .trim()
  .min(USERNAME_MIN_LENGTH, {
    message: `Username must be at least ${String(USERNAME_MIN_LENGTH)} character.`,
  })
  .max(USERNAME_MAX_LENGTH, {
    message: `Username must be at most ${String(USERNAME_MAX_LENGTH)} characters.`,
  })
  .regex(USERNAME_REGEX, {
    message: 'Username can only contain letters, digits, underscores, or dashes.',
  })

const avatarUrlFieldSchema = z.url({ message: 'Avatar URL must be a valid URL.' })

export const personalInfoFormSchema = z.object({
  username: trimmedUsernameSchema.nullable(),
  avatarUrl: avatarUrlFieldSchema.nullable(),
  isMarketingOptedIn: z.boolean(),
})

export type PersonalInfoFormValues = z.infer<typeof personalInfoFormSchema>

export const updateProfileInputSchema = z
  .object({
    username: trimmedUsernameSchema.nullable().optional(),
    avatarUrl: avatarUrlFieldSchema.nullable().optional(),
    isMarketingOptedIn: z.boolean().optional(),
    defaultCurrency: z.enum(SUPPORTED_CURRENCY_VALUES).optional(),
  })
  .strict()

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>

export const changePasswordInputSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Current password is required.' }),
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, {
        message: `New password must be at least ${String(MIN_PASSWORD_LENGTH)} characters.`,
      })
      .max(MAX_PASSWORD_LENGTH, {
        message: `New password must be at most ${String(MAX_PASSWORD_LENGTH)} characters.`,
      }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your new password.' }),
  })
  .superRefine((data, context) => {
    if (data.currentPassword.length > 0 && data.currentPassword === data.newPassword) {
      context.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'New password must differ from current password.',
      })
    }
    if (data.newPassword !== data.confirmPassword) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match.',
      })
    }
  })

export type ChangePasswordFormInput = z.infer<typeof changePasswordInputSchema>

export interface ChangePasswordApiInput {
  currentPassword: string
  newPassword: string
}

export const changePasswordResponseSchema = z.object({
  message: z.string(),
})

export type ChangePasswordResponse = z.infer<typeof changePasswordResponseSchema>
